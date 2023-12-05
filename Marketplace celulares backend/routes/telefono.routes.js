'use strict'

var express = require('express');
var phoneController = require('../controller/telefono.controller');
var connectMultiparty = require('connect-multiparty');
var mdAuth = require('../middlewares/autenticacion');
const upload = connectMultiparty({uploadDir: './uploads/phone'})

var api = express.Router();

api.put('/savePhone/:idU', mdAuth.ensureAuth, phoneController.addPhone);
api.delete('/deletePhone/:idU/:idP', phoneController.deletePhone);
api.get('/getPhones', phoneController.getPhones);
api.put('/updatePhone/:idU/:idP', phoneController.updatePhone);

//Imagenes
api.put('/subirImagen/:idU/:idP', [upload], phoneController.phoneImage);
api.get('/getPhoneImage/:fileName', [upload], phoneController.getImage);

//Admin
api.delete('/deleteTrans//:idU/:idT', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], phoneController.deleteTransaccion);;

module.exports = api;

