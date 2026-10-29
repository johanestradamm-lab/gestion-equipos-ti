const oracledb = require('oracledb');

// Habilitar el modo de salida en objetos JSON simples para que sea más fácil de usar
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// Configuración de credenciales de conexión
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING
};

// Función para obtener una conexión a la base de datos
async function obtenerConexion() {
  try {
    const conexion = await oracledb.getConnection(dbConfig);
    return conexion;
  } catch (error) {
    console.error('Error al conectar con la base de datos Oracle:', error);
    throw error;
  }
}

module.exports = { obtenerConexion, oracledb };