const mongoose = require('mongoose');
const { Schema } = mongoose;

const infoSchema = new Schema({
  nombre: String,
  saldoEfectivo: Number,
  saldoTD: Number,
  gastoTC: Number,
  fecha: String,
  iniciales: [Number],
  pagosPendientes: Number,
  limite: Number,
  saldoViaje: Number,
});

module.exports = mongoose.model('Info', infoSchema);
