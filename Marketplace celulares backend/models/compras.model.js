'use strict'

var mongoose = require('mongoose');
var esquema = mongoose.Schema;

var esquemaCompras = esquema({
    fechaCompra: Date,
    unidadesCompradas: Number,
    total: Number,
    qr: String,
    telefono : String
})

module.exports = mongoose.model('compra', esquemaCompras)