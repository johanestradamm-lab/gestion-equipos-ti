const { obtenerConexion, oracledb } = require('../db');

// 1. Obtener todas las órdenes (incluye o.historial)
const obtenerOrdenes = async (req, res) => {
  let conexion;
  try {
    conexion = await obtenerConexion();
    const sql = `
      SELECT o.id, o.equipo_id, e.tipo AS equipo_tipo, e.marca AS equipo_marca,
             c.nombre AS cliente_nombre, o.falla_reportada, o.diagnostico, 
             o.estado, o.costo_total, o.historial, TO_CHAR(o.fecha_ingreso, 'YYYY-MM-DD') AS fecha_ingreso
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

// 2. Crear una nueva orden (incluye costo inicial opcional)
const crearOrden = async (req, res) => {
  let conexion;
  try {
    conexion = await obtenerConexion();
    const { equipo_id, falla_reportada, costo, costo_total } = req.body;

    if (!equipo_id || !falla_reportada) {
      return res.status(400).json({ error: 'equipo_id y falla_reportada son obligatorios' });
    }

    const valorCosto = parseFloat(costo_total ?? costo) || 0;

    const sql = `INSERT INTO ordenes_servicio (equipo_id, falla_reportada, costo_total) 
                 VALUES (:equipo_id, :falla_reportada, :costo_total) 
                 RETURNING id INTO :id`;

    const resultado = await conexion.execute(
      sql,
      {
        equipo_id,
        falla_reportada,
        costo_total: valorCosto,
        id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      },
      { autoCommit: true }
    );

    const nuevoId = resultado.outBinds.id[0];
    res.status(201).json({ id: nuevoId, equipo_id, falla_reportada, costo_total: valorCosto, estado: 'INGRESADO' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la orden de servicio', detalle: error.message });
  } finally {
    if (conexion) await conexion.close();
  }
};

// 3. Actualizar orden (incluye historial/trazabilidad)
const actualizarOrden = async (req, res) => {
  let conexion;
  try {
    conexion = await obtenerConexion();
    const idBuscado = parseInt(req.params.id);
    
    const { 
      diagnostico, DIAGNOSTICO, 
      estado, ESTADO, 
      costo_total, costo, COSTO_TOTAL,
      falla_reportada, FALLA_REPORTADA, falla,
      historial, HISTORIAL
    } = req.body;

    const fallaFinal = falla_reportada || FALLA_REPORTADA || falla || null;
    const diagnosticoFinal = diagnostico || DIAGNOSTICO || null;
    const estadoFinal = estado || ESTADO || null;
    const costoFinal = costo_total ?? costo ?? COSTO_TOTAL ?? null;
    const historialFinal = historial || HISTORIAL || null;

    const sql = `UPDATE ordenes_servicio 
                 SET falla_reportada = NVL(:falla_reportada, falla_reportada),
                     diagnostico = NVL(:diagnostico, diagnostico),
                     estado = NVL(:estado, estado),
                     costo_total = NVL(:costo_total, costo_total),
                     historial = NVL(:historial, historial)
                 WHERE id = :id`;

    const resultado = await conexion.execute(
      sql,
      {
        falla_reportada: fallaFinal,
        diagnostico: diagnosticoFinal,
        estado: estadoFinal,
        costo_total: costoFinal,
        historial: historialFinal,
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