const { obtenerConexion } = require('../db');

// 1. Obtener todos los clientes
const obtenerClientes = async (req, res) => {
  let conexion;
  try {
    conexion = await obtenerConexion();
    const resultado = await conexion.execute(
      'SELECT id, nombre, telefono, email, direccion FROM clientes ORDER BY id DESC'
    );
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener clientes', detalle: error.message });
  } finally {
    if (conexion) await conexion.close();
  }
};

// 2. Obtener un cliente por ID
const obtenerClientePorId = async (req, res) => {
  let conexion;
  try {
    conexion = await obtenerConexion();
    const idBuscado = parseInt(req.params.id);
    const resultado = await conexion.execute(
      'SELECT id, nombre, telefono, email, direccion FROM clientes WHERE id = :id',
      [idBuscado]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar cliente', detalle: error.message });
  } finally {
    if (conexion) await conexion.close();
  }
};

// 3. Crear un nuevo cliente
const crearCliente = async (req, res) => {
  let conexion;
  try {
    conexion = await obtenerConexion();
    const { nombre, telefono, email, direccion } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    const sql = `INSERT INTO clientes (nombre, telefono, email, direccion) 
                 VALUES (:nombre, :telefono, :email, :direccion) 
                 RETURNING id INTO :id`;

    const resultado = await conexion.execute(
      sql,
      {
        nombre,
        telefono: telefono || null,
        email: email || null,
        direccion: direccion || null,
        id: { type: require('../db').oracledb.NUMBER, dir: require('../db').oracledb.BIND_OUT }
      },
      { autoCommit: true }
    );

    const nuevoId = resultado.outBinds.id[0];
    res.status(201).json({ id: nuevoId, nombre, telefono, email, direccion });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear cliente', detalle: error.message });
  } finally {
    if (conexion) await conexion.close();
  }
};

// 4. Actualizar un cliente
const actualizarCliente = async (req, res) => {
  let conexion;
  try {
    conexion = await obtenerConexion();
    const idBuscado = parseInt(req.params.id);
    const { nombre, telefono, email, direccion } = req.body;

    const sql = `UPDATE clientes 
                 SET nombre = NVL(:nombre, nombre),
                     telefono = NVL(:telefono, telefono),
                     email = NVL(:email, email),
                     direccion = NVL(:direccion, direccion)
                 WHERE id = :id`;

    const resultado = await conexion.execute(
      sql,
      {
        nombre: nombre || null,
        telefono: telefono || null,
        email: email || null,
        direccion: direccion || null,
        id: idBuscado
      },
      { autoCommit: true }
    );

    if (resultado.rowsAffected === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    res.json({ mensaje: 'Cliente actualizado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar cliente', detalle: error.message });
  } finally {
    if (conexion) await conexion.close();
  }
};

// 5. Eliminar cliente
const eliminarCliente = async (req, res) => {
  let conexion;
  try {
    conexion = await obtenerConexion();
    const idBuscado = parseInt(req.params.id);

    const resultado = await conexion.execute(
      'DELETE FROM clientes WHERE id = :id',
      [idBuscado],
      { autoCommit: true }
    );

    if (resultado.rowsAffected === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    res.json({ mensaje: 'Cliente eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar cliente', detalle: error.message });
  } finally {
    if (conexion) await conexion.close();
  }
};

module.exports = {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente
};