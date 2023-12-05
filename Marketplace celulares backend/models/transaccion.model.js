'use strict'

var mongoose = require('mongoose');
var esquema = mongoose.Schema;

var esquemaTransaccion = esquema({
    fechaPublicacion : Date,
    tipoTransaccion: String,
    telefono: String,
    usuario : String
})

module.exports = mongoose.model('transaccion', esquemaTransaccion)