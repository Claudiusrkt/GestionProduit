const ProduitRepository = require('../repository/ProduitRepository');

class ProduitController {
    static async getAll(req, res) {
        const produits = await ProduitRepository.findAll();
        res.json(produits);
    }

    static async getById(req, res) {
        const produit = await ProduitRepository.findById(req.params.idProduit);
        if (!produit) return res.status(404).json({ message: "Produit non trouvé" });
        res.json(produit);
    }

    static async create(req, res) {
        try {
            const produit = await ProduitRepository.save(req.body);
            res.status(201).json(produit);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    static async update(req, res) {
        const produit = await ProduitRepository.update(req.params.idProduit, req.body);
        if (!produit) return res.status(404).json({ message: "Produit non trouvé" });
        res.json(produit);
    }

    static async delete(req, res) {
        const deleted = await ProduitRepository.deleteById(req.params.idProduit);
        if (!deleted) return res.status(404).json({ message: "Produit non trouvé" });
        res.json({ message: "Produit supprimé" });
    }
}

module.exports = ProduitController;
