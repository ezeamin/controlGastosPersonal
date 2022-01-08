const mongoose = require('mongoose');
const { Schema } = mongoose;

const pagosSchema = new Schema({
  codigo: String,
  concepto: String,
  importe: Number,
  fechaVencimiento: String,
  fechaRegistro: String,
  comentario: String,
});

module.exports = mongoose.model('Pagos', pagosSchema);
