'use strict'

var User = require('../models/user.model');
var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');
var path = require('path');
var jwt = require('../services/jwt');

function crearAdmin(req, res){
    let user = new User();

    User.findOne({username: 'admin'}, (err, userFound)=>{
        if(err){
            console.log('Error al crear al administrador', err);
        }else if(userFound){
            console.log('Usuario administrador ya creado');
        }else{
            user.password = 'admin'
            bcrypt.hash(user.password, null, null, (err, passwordHashed)=>{
                if(err){
                    console.log('Error general al encriptar la contraseña', err);
                }else if(passwordHashed){
                    user.name = 'admin';
                    user.lastname = 'admin';
                    user.username = 'admin';
                    user.password = passwordHashed;
                    user.email = 'admin@gmail.com';
                    user.role = 'ROLE_ADMIN';

                    user.save((err, userSaved)=>{
                        if (err){
                            console.log('Error general al crear al usuario administrador', err);
                        }else if(userSaved){
                            console.log('Usuario administrador creado con exito', userSaved);
                        }else{
                            console.log('No se creo al usuario administrador');
                        }
                    })
                }else{
                    console.log('No se encripto la contraseña');
                }
            })
        }
    })
}

module.exports={
    crearAdmin 
}