const Produit = require('../model/Produit');

class ProduitRepository {
    async findAll() {
        return await Produit.findAll();
    }

    async findById(idProduit) {
        return await Produit.findByPk(idProduit);
    }

    async save(produit) {
        return await Produit.create(produit);
    }

    async update(idProduit, produitData) {
        const produit = await Produit.findByPk(idProduit);
        if (!produit) return null;
        return await produit.update(produitData);
    }

    async deleteById(idProduit) {
        return await Produit.destroy({ where: { idProduit } });
    }
}

module.exports = new ProduitRepository();
