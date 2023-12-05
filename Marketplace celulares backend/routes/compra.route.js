'use strict'

var express = require('express');
var compraController = require('../controller/compra.controller');
var connectMultiparty = require('connect-multiparty');
var mdAuth = require('../middlewares/autenticacion');
const upload = connectMultiparty({uploadDir: './uploads/phone'})

var api = express.Router();

api.put('/comprar/:idU/:idP', mdAuth.ensureAuth, compraController.comprar);

module.exports = api;