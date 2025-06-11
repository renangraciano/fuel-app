// src/models/Abastecimento.js
const mongoose = require('mongoose');

const AbastecimentoSchema = new mongoose.Schema({
  data: { type: Date, required: true },
  veiculo: { type: String, required: true },
  km_atual: { type: Number, required: true },
  quantidade_litros: { type: Number, required: true },
  valor_total: { type: Number, required: true },
  posto: { type: String, required: true },
  combustivel: { type: String, required: true }
}, { timestamps: true });

// Add indexes for frequent queries
AbastecimentoSchema.index({ veiculo: 1 });
AbastecimentoSchema.index({ data: -1 });

module.exports = mongoose.model('Abastecimento', AbastecimentoSchema);