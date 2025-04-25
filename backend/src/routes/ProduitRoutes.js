const express = require('express');
const ProduitController = require('../controller/ProduitController');

const router = express.Router();

router.get('/', ProduitController.getAll);
router.get('/:idProduit', ProduitController.getById);
router.post('/', ProduitController.create);
router.put('/:idProduit', ProduitController.update);
router.delete('/:idProduit', ProduitController.delete);

module.exports = router;