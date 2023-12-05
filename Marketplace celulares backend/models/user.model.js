'use strict'

var mongoose = require('mongoose');
var esquema = mongoose.Schema;

var esquemaUsuario = esquema({
    name : String,
    lastname: String,
    username : String,
    password: String,
    email : String,
    role: String,
    image: String,
    //ventas: [{type: esquema.ObjectId, ref: 'venta'}],
    compras: [{type: esquema.ObjectId, ref: 'compra'}]
})

module.exports = mongoose.model('user', esquemaUsuario)