'use strict'

var mongoose = require('mongoose');
var esquema = mongoose.Schema;

var esquemaCompras = esquema({
    fechaCompra: Date,
    unidadesCompradas: Number,
    qr: String,
    telefono : [{type: esquema.ObjectId, ref: 'telefono'}]
})

module.exports = mongoose.model('compra', esquemaCompras)