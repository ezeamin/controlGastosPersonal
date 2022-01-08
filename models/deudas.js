const mongoose = require('mongoose');
const { Schema } = mongoose;

const detalleSchema = new Schema({
  importe: Number,
  comentario: String,
  origen: String,
  cuenta: String,
  fecha: String,
  codigoDeuda: String,
});

const deudasSchema = new Schema({
  nombre: String,
  lista: [detalleSchema],
  total: Number,
  codigoDeudor: String,
});

module.exports = mongoose.model('Deudas', deudasSchema);
