// src/controllers/AbastecimentoController.js
const Abastecimento = require('../models/Abastecimento');
const { validationResult } = require('express-validator');

// Standardized error response
const sendError = (res, status, message) => {
  res.status(status).json({ error: message });
};

// Create new abastecimento
exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, errors.array().map(e => e.msg).join(', '));
  }

  try {
    const abastecimento = await Abastecimento.create(req.body);
    res.status(201).json({ data: abastecimento });
  } catch (err) {
    sendError(res, 400, err.message);
  }
};

// List abastecimentos with optional filters and pagination
exports.list = async (req, res) => {
  try {
    const { veiculo, dataInicial, dataFinal, limit = 10, page = 1 } = req.query;
    let filtro = {};

    if (veiculo) filtro.veiculo = { $regex: veiculo, $options: 'i' }; // Case-insensitive
    if (dataInicial || dataFinal) {
      filtro.data = {};
      if (dataInicial) filtro.data.$gte = new Date(dataInicial);
      if (dataFinal) filtro.data.$lte = new Date(dataFinal);
    }

    const perPage = Math.max(1, parseInt(limit, 10));
    const currentPage = Math.max(1, parseInt(page, 10));

    const totalCount = await Abastecimento.countDocuments(filtro);
    const totalPaginas = Math.ceil(totalCount / perPage);

    const abastecimentos = await Abastecimento.find(filtro)
      .sort({ data: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.json({
      data: abastecimentos,
      totalPaginas,
      paginaAtual: currentPage,
      totalCount,
    });
  } catch (err) {
    sendError(res, 500, err.message);
  }
};

// Get abastecimento by ID
exports.getById = async (req, res) => {
  try {
    const abastecimento = await Abastecimento.findById(req.params.id);
    if (!abastecimento) return sendError(res, 404, 'Abastecimento não encontrado');
    res.json({ data: abastecimento });
  } catch (err) {
    sendError(res, 500, err.message);
  }
};

// Update abastecimento
exports.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, errors.array().map(e => e.msg).join(', '));
  }

  try {
    const abastecimento = await Abastecimento.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!abastecimento) return sendError(res, 404, 'Abastecimento não encontrado');
    res.json({ data: abastecimento });
  } catch (err) {
    sendError(res, 400, err.message);
  }
};

// Remove abastecimento
exports.remove = async (req, res) => {
  try {
    const abastecimento = await Abastecimento.findByIdAndDelete(req.params.id);
    if (!abastecimento) return sendError(res, 404, 'Abastecimento não encontrado');
    res.json({ message: 'Abastecimento removido com sucesso' });
  } catch (err) {
    sendError(res, 500, err.message);
  }
};