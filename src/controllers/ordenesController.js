const { obtenerConexion, oracledb } = require('../db');

// 1. Obtener todas las órdenes
const obtenerOrdenes = async (req, res) => {
  let conexion;
  try {
    conexion = await obtenerConexion();
    const sql = `
      SELECT o.id, o.equipo_id, e.tipo AS equipo_tipo, e.marca AS equipo_marca,
             c.nombre AS cliente_nombre, o.falla_reportada, o.diagnostico, 
             o.estado, o.costo_total, TO_CHAR(o.fecha_ingreso, 'YYYY-MM-DD') AS fecha_ingreso
      FROM ordenes_servicio o
      JOIN equipos e ON o.equipo_id = e.id
      JOIN clientes c ON e.cliente_id = c.id
      ORDER BY o.id DESC`;
    
    const resultado = await conexion.execute(sql);
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las órdenes', detalle: error.message });
  } finally {
    if (conexion) await conexion.close();
  }
};

// 2. Crear una nueva orden
const crearOrden = async (req, res) => {
  let conexion;
  try {
    conexion = await obtenerConexion();
    const { equipo_id, falla_reportada } = req.body;

    if (!equipo_id || !falla_reportada) {
      return res.status(400).json({ error: 'equipo_id y falla_reportada son obligatorios' });
    }

    const sql = `INSERT INTO ordenes_servicio (equipo_id, falla_reportada) 
                 VALUES (:equipo_id, :falla_reportada) 
                 RETURNING id INTO :id`;

    const resultado = await conexion.execute(
      sql,
      {
        equipo_id,
        falla_reportada,
        id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      },
      { autoCommit: true }
    );

    const nuevoId = resultado.outBinds.id[0];
    res.status(201).json({ id: nuevoId, equipo_id, falla_reportada, estado: 'INGRESADO' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la orden de servicio', detalle: error.message });
  } finally {
    if (conexion) await conexion.close();
  }
};

// 3. Actualizar diagnóstico, estado y costo de la orden
const actualizarOrden = async (req, res) => {
  let conexion;
  try {
    conexion = await obtenerConexion();
    const idBuscado = parseInt(req.params.id);
    const { diagnostico, estado, costo_total } = req.body;

    const sql = `UPDATE ordenes_servicio 
                 SET diagnostico = NVL(:diagnostico, diagnostico),
                     estado = NVL(:estado, estado),
                     costo_total = NVL(:costo_total, costo_total)
                 WHERE id = :id`;

    const resultado = await conexion.execute(
      sql,
      {
        diagnostico: diagnostico || null,
        estado: estado || null,
        costo_total: costo_total || null,
        id: idBuscado
      },
      { autoCommit: true }
    );

    if (resultado.rowsAffected === 0) {
      return res.status(404).json({ mensaje: 'Orden de servicio no encontrada' });
    }

    res.json({ mensaje: 'Orden de servicio actualizada con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la orden', detalle: error.message });
  } finally {
    if (conexion) await conexion.close();
  }
};

// 4. Anular orden (Soft Delete)
const eliminarOrden = async (req, res) => {
  let conexion;
  try {
    conexion = await obtenerConexion();
    const idBuscado = parseInt(req.params.id);

    const sql = `UPDATE ordenes_servicio 
                 SET estado = 'ANULADO' 
                 WHERE id = :id`;

    const resultado = await conexion.execute(
      sql,
      { id: idBuscado },
      { autoCommit: true }
    );

    if (resultado.rowsAffected === 0) {
      return res.status(404).json({ mensaje: 'Orden de servicio no encontrada' });
    }

    res.json({ mensaje: 'Orden de servicio anulada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al anular la orden', detalle: error.message });
  } finally {
    if (conexion) await conexion.close();
  }
};

module.exports = {
  obtenerOrdenes,
  crearOrden,
  actualizarOrden,
  eliminarOrden
};