const mongoose = require('mongoose');
const { Schema } = mongoose;

const gastosSchema = new Schema({
  concepto: String,
  categoria: String,
  importe: Number,
  pago: String,
  origen: String,
  comentario: String,
  fecha: String,
  codigo: String,
  debo: Boolean,
  mongoDate: Date,
});

module.exports = mongoose.model('Gastos', gastosSchema);
