'use strict'

var mongoose = require('mongoose');
var esquema = mongoose.Schema;

var esquemaCodigo = esquema({
    codigo: String,
})

module.exports = mongoose.model('codigo', esquemaCodigo)