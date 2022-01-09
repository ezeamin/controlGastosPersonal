const mongoose = require('mongoose');
const { Schema } = mongoose;

const statsSchema = new Schema({
  total: Number,
  gastos: {
    efectivoPropio: Number,
    efectivoPapas: Number,
    TC: Number,
    TCPropio: Number,
    TD: Number,
  },
  promedioDiario: Number,
  promedioDiarioPropio: Number,
  porcentajePropio: Number,
  porcentajePapas: Number,
  iniciales: {
    efectivo: Number,
    TD: Number,
  },
  finales: {
    efectivo: Number,
    TD: Number,
  },
});

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

const oldSchema = new Schema({
  fechaInicio: String,
  fechaFin: String,
  dias: Number,
  stats: statsSchema,
  gastos: [gastosSchema],
});

module.exports = mongoose.model('Old', oldSchema);
