require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // <--- Módulo nativo de Node.js

const app = express();
const PORT = process.env.PORT || 3000;

const clientesRoutes = require('./routes/clientes');
const equiposRoutes = require('./routes/equipos');
const ordenesRoutes = require('./routes/ordenes');

app.use(cors());
app.use(express.json());

// Servir la carpeta 'public' para el Frontend
app.use(express.static(path.join(__dirname, '../public')));

app.use('/clientes', clientesRoutes);
app.use('/equipos', equiposRoutes);
app.use('/ordenes', ordenesRoutes);

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});