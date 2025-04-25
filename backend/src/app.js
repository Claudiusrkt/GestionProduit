const express = require('express');
const connectDB = require('./config/database');
const ProduitRoutes = require('./routes/ProduitRoutes');
const cors = require('cors');

const app = express();

connectDB.sync({ alter: true })
    .then(() => console.log(" Base de données synchronisée"))
    .catch(err => console.error(" Erreur de synchronisation :", err));

app.use(express.json());
app.use(cors());

app.use('/Produit', ProduitRoutes);

module.exports = app;