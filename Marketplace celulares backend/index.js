'use strict'

var express = require ('express');
var mongoose = require ('mongoose');
var app = require ('./app');
var port = '3200';
var crearAdmin = require('./controller/user.controller');

mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);

mongoose.connect('mongodb://localhost:27017/marketPlaceCelularesDB', {useNewUrlParser: true, useFindAndModify: true})
    .then(()=>{
        console.log('conectado a la bd');
        crearAdmin.crearAdmin();
        app.listen(port, ()=>{
            console.log('servidor de express corriendo')
        })
    })
    .catch((err)=>{console.log('Error al tratar de conectarse', err)})