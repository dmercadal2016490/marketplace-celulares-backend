'use strict'

var express = require('express');
var userController = require('../controller/user.controller');
var connectMultiparty = require('connect-multiparty');
var mdAuth = require('../middlewares/autenticacion');
const upload = connectMultiparty({uploadDir: './uploads/user'})

var api = express.Router();

api.post('/saveUser', userController.registrar);
api.post('/login', userController.login);
api.get('/getUsers', userController.getUsers);
api.delete('/deleteUser/:idU', mdAuth.ensureAuth, userController.deleteUser);
api.put('/updateUser/:idU', mdAuth.ensureAuth, userController.updateUser);
api.put('/actualizarContra/:idU', mdAuth.ensureAuth, userController.cambiarContra);
api.post('/generarCodigo', userController.generarCodigo);
//api.post('/cambiarContra', );

//Imagenes
api.put('/:id/subirImagen', [mdAuth.ensureAuth, upload], userController.subirImagen);
api.get('/getImage/:fileName', [upload], userController.getImage)

module.exports = api;