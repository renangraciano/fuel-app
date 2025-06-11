// src/routes/abastecimentoRoutes.js
const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const abastecimentoController = require('../controllers/abastecimentoController');

// Validation middleware
const createUpdateValidation = [
  body('data').isISO8601().toDate().withMessage('Data inválida'),
  body('veiculo').isString().trim().notEmpty().withMessage('Veículo é obrigatório'),
  body('km_atual').isFloat({ min: 0 }).withMessage('KM atual deve ser um número positivo'),
  body('quantidade_litros').isFloat({ min: 0 }).withMessage('Quantidade de litros deve ser positiva'),
  body('valor_total').isFloat({ min: 0 }).withMessage('Valor total deve ser positivo'),
  body('posto').isString().trim().notEmpty().withMessage('Posto é obrigatório'),
  body('combustivel').isString().trim().notEmpty().withMessage('Combustível é obrigatório'),
];

const listValidation = [
  query('veiculo').optional().isString().trim(),
  query('dataInicial').optional().isISO8601().toDate(),
  query('dataFinal').optional().isISO8601().toDate(),
  query('limit').optional().isInt({ min: 1 }).toInt(),
  query('page').optional().isInt({ min: 1 }).toInt(),
];

const idValidation = [
  param('id').isMongoId().withMessage('ID inválido'),
];

// CRUD routes
router.post('/', createUpdateValidation, abastecimentoController.create);
router.get('/', listValidation, abastecimentoController.list);
router.get('/:id', idValidation, abastecimentoController.getById);
router.put('/:id', [...idValidation, ...createUpdateValidation], abastecimentoController.update);
router.delete('/:id', idValidation, abastecimentoController.remove);

// Extra routes for frontend
router.get('/veiculos', [
  query('q').optional().isString().trim(),
], async (req, res) => {
  try {
    const q = req.query.q || '';
    const placas = await require('../models/Abastecimento').distinct('veiculo', {
      veiculo: { $regex: q, $options: 'i' }
    });
    res.json(placas.slice(0, 10));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/ultimo-km', [
  query('veiculo').optional().isString().trim(),
], async (req, res) => {
  try {
    const { veiculo } = req.query;
    if (!veiculo) return res.json({ km_atual: "" });
    const ultimo = await require('../models/Abastecimento')
      .findOne({ veiculo })
      .sort({ data: -1 });
    res.json({ km_atual: ultimo ? Number(ultimo.km_atual) : "" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;