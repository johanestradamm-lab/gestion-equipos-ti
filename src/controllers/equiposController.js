const { obtenerConexion, oracledb } = require('../db');

// 1. Obtener todos los equipos (con el nombre del cliente asociado)
const obtenerEquipos = async (req, res) => {
  let conexion;
  try {
    conexion = await obtenerConexion();
    const sql = `
      SELECT e.id, e.cliente_id, c.nombre AS cliente_nombre, e.tipo, e.marca, e.modelo, e.numero_serie 
      FROM equipos e
      JOIN clientes c ON e.cliente_id = c.id
      ORDER BY e.id ASC`;
    
    const resultado = await conexion.execute(sql);
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los equipos', detalle: error.message });
  } finally {
    if (conexion) await conexion.close();
  }
};

// 2. Obtener un equipo por ID
const obtenerEquipoPorId = async (req, res) => {
  let conexion;
  try {
    conexion = await obtenerConexion();
    const idBuscado = parseInt(req.params.id);
    const sql = `
      SELECT e.id, e.cliente_id, c.nombre AS cliente_nombre, e.tipo, e.marca, e.modelo, e.numero_serie 
      FROM equipos e
      JOIN clientes c ON e.cliente_id = c.id
      WHERE e.id = :id`;

    const resultado = await conexion.execute(sql, [idBuscado]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Equipo no encontrado' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar el equipo', detalle: error.message });
  } finally {
    if (conexion) await conexion.close();
  }
};

// 3. Crear un nuevo equipo
const crearEquipo = async (req, res) => {
  let conexion;
  try {
    conexion = await obtenerConexion();
    const { cliente_id, tipo, marca, modelo, numero_serie } = req.body;

    if (!cliente_id || !tipo || !marca) {
      return res.status(400).json({ error: 'cliente_id, tipo y marca son obligatorios' });
    }

    const sql = `INSERT INTO equipos (cliente_id, tipo, marca, modelo, numero_serie) 
                 VALUES (:cliente_id, :tipo, :marca, :modelo, :numero_serie) 
                 RETURNING id INTO :id`;

    const resultado = await conexion.execute(
      sql,
      {
        cliente_id,
        tipo,
        marca,
        modelo: modelo || null,
        numero_serie: numero_serie || null,
        id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      },
      { autoCommit: true }
    );

    const nuevoId = resultado.outBinds.id[0];
    res.status(201).json({ id: nuevoId, cliente_id, tipo, marca, modelo, numero_serie });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el equipo', detalle: error.message });
  } finally {
    if (conexion) await conexion.close();
  }
};

// 4. Actualizar equipo
const actualizarEquipo = async (req, res) => {
  let conexion;
  try {
    conexion = await obtenerConexion();
    const idBuscado = parseInt(req.params.id);
    const { tipo, marca, modelo, numero_serie } = req.body;

    const sql = `UPDATE equipos 
                 SET tipo = NVL(:tipo, tipo), 
                     marca = NVL(:marca, marca),
                     modelo = NVL(:modelo, modelo),
                     numero_serie = NVL(:numero_serie, numero_serie)
                 WHERE id = :id`;

    const resultado = await conexion.execute(
      sql,
      {
        tipo: tipo || null,
        marca: marca || null,
        modelo: modelo || null,
        numero_serie: numero_serie || null,
        id: idBuscado
      },
      { autoCommit: true }
    );

    if (resultado.rowsAffected === 0) {
      return res.status(404).json({ mensaje: 'Equipo no encontrado' });
    }

    res.json({ mensaje: 'Equipo actualizado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el equipo', detalle: error.message });
  } finally {
    if (conexion) await conexion.close();
  }
};

// 5. Eliminar equipo
const eliminarEquipo = async (req, res) => {
  let conexion;
  try {
    conexion = await obtenerConexion();
    const idBuscado = parseInt(req.params.id);

    const resultado = await conexion.execute(
      'DELETE FROM equipos WHERE id = :id',
      [idBuscado],
      { autoCommit: true }
    );

    if (resultado.rowsAffected === 0) {
      return res.status(404).json({ mensaje: 'Equipo no encontrado' });
    }

    res.json({ mensaje: 'Equipo eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el equipo', detalle: error.message });
  } finally {
    if (conexion) await conexion.close();
  }
};

module.exports = {
  obtenerEquipos,
  obtenerEquipoPorId,
  crearEquipo,
  actualizarEquipo,
  eliminarEquipo
};