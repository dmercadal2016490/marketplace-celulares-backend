'use strict'

var mongoose = require('mongoose');
var esquema = mongoose.Schema;

var esquemaVentas = esquema({
    fechaPublicacion : Date,
    unidadesParaVender: Number,
    telefono : [{type: esquema.ObjectId, ref: 'telefono'}]
})

module.exports = mongoose.model('venta', esquemaVentas)