'use strict'

var mongoose = require('mongoose');
var esquema = mongoose.Schema;

var esuqemaTelefono = esquema({
    marca : String,
    serie : String,
    procesador: String,
    ram : String,
    bateria : String,
    precio : Number,
    unidades: Number,
    vendedor : [{type: esquema.ObjectId, ref: 'user'}]
})

module.exports = mongoose.model('telefono', esuqemaTelefono)