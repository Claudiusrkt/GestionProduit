const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Produit = sequelize.define('Produit', {
    idProduit: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nomProduit: {
      type: DataTypes.STRING,
      allowNull: false
    },
    PrixUnitaire: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Quantite: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'produitKisoa',
    timestamps: false
  });
  
  module.exports = Produit;