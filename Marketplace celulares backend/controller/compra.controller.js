'use strict'

var Phone = require('../models/telefono.model');
var User = require('../models/user.model');
var Compra = require('../models/compras.model');
var Transaccion = require('../models/transaccion.model');
var fs = require('fs');
var path = require('path');
var jwt = require('../services/jwt');
const { use } = require('../app');
const { measureMemory } = require('vm');

function comprar(req, res){
    var userId = req.params.idU;
    var phoneId = req.params.idP;
    var compra = new Compra();
    var transaccion = new Transaccion();
    var params = req.body;

    if(userId != req.user.sub){
        res.status(403).send({message: 'No tienes permisos para comprar un telefono'});
    }else{
        if(params.unidadesCompradas){
            User.findById(userId, (err, userFind)=>{
                if(err){
                    res.status(500).send({message: 'Error general al buscar al usuario'});
                    console.log(err);
                }else if(userFind){
                    Phone.findById(phoneId, (err, phoneFound)=>{
                        if(err){
                            res.status(500).send({message: 'Error general al buscar el telefono'});
                            console.log(err);
                        }else if(phoneFound){
                            if(phoneFound.unidades <= 0){
                                res.send({message: 'No hay unidades disponibles de este telefono'});
                            }else{
                                if(params.unidadesCompradas > phoneFound.unidades){
                                    res.send({message: 'No hay suficientes unidades disponibles de este telefono'});
                                }else{
                                    Phone.findByIdAndUpdate(phoneId, {$inc:{unidades: -params.unidadesCompradas}}, (err,menos)=>{
                                        if(err){
                                            res.status(500).send({message:'Error general al quitar unidades'});
                                            console.log(err);
                                        }else if(menos){
                                            compra.fechaCompra = Date.now();
                                            compra.unidadesCompradas = params.unidadesCompradas;
                                            compra.total = params.unidadesCompradas * phoneFound.precio;
                                            compra.telefono = phoneFound.marca + ' ' + phoneFound.serie;

                                            compra.save((err, compraSaved)=>{
                                                if(err){
                                                    res.status(500).send({message: 'Error general al Comprar el telefono'});
                                                    console.log(err);
                                                }else if(compraSaved){
                                                    res.send({message: 'Compra realizada con exito ', compraSaved});

                                                    User.findByIdAndUpdate(userId, {$push: {compras: compraSaved._id}}, {new:true}, (err, userPushed)=>{
                                                        if(err){
                                                            res.status(500).send({message: 'Error general al pushear'});
                                                            console.log(err);
                                                        }else if(userPushed){
                                                            transaccion.fechaPublicacion = Date.now();
                                                            transaccion.tipoTransaccion = 'Compra';
                                                            transaccion.telefono = phoneFound.marca +' '+phoneFound.serie;
                                                            transaccion.usuario = userFind.username;

                                                            transaccion.save((err, transaccionSaved)=>{
                                                                if(err){
                                                                    res.status(500).send({message: 'Error general al guardar la transaccion'});
                                                                    console.log(err);
                                                                }else if(transaccionSaved){
                                                                    console.log('Operacion completada');
                                                                }else{
                                                                    res.send({message: 'No se guardo la transaccion'});
                                                                }
                                                            })
                                                        }else{
                                                            res.send({message: 'No se pusheo'});
                                                        }
                                                    })
                                                }else{
                                                    res.send({message: 'No se realizo la compra'});
                                                }
                                            })
                                        }else{
                                            res.send({message : 'No se quitaron unidades'});
                                        }
                                    })
                                }
                            }
                        }else{
                            res.status(404).send({message: 'No se encontro el telefono'});
                        }
                    })
                }else{
                    res.status(404).send({message: 'No se encontro al usuario'});
                }
            })
        }else{
            res.send({message : 'Porfavor introduce la cantidad de telefonos que quieres comprar'});
        }
    }
}

function getMyCompras(req,res){
    var userId = req.params.idU;

    if(userId != req.user.sub){
        res.status(403).send({message: 'No tienes permisos'});
    }else{
    User.findById(userId).populate({path:'compras', populate:{path:'compras'}}).exec((err,compras)=>{
        if(err){
            res.status(500).send({message:'Error general'});
            console.log(err);
        }else if(compras){
            res.send({message: 'compras: ', compras});
        }else{
            res.status(404).send({message: 'No tienes compras'});
        }
    })
    }
}

/*function devolver(req,res){
    var userId = req.params.idU;
    var phoneId = req.params.idP;
    var comprasId = req.params.idC;

    if(userId != req.user.sub){
        res.status(403).send({message: 'No tienes permisos para regresar un telefono'});
    }else{
        User.findById(userId, (err, userFind)=>{
            if(err){
                res.status(500).send({message: 'Error general al buscar al usuario'});
                console.log(err);
            }else if(userFind){
                Phone.findById(phoneId, (err, phoneFound)=>{
                    if(err){
                        res.status(500).send({message: 'Error general al buscar el telefono'});
                        console.log(err);
                    }else if(phoneFound){
                        Compra.findById(comprasId, (err, compraFound)=>{
                            res.status(500).send({message: 'Error general al buscar la compra'});
                            console.log(err);
                        })
                    }else{
                        res.status(404).send({message: 'No se encontro el telefono'});
                    }
                })
            }else{
                res.status(404).send({message: 'No se encontro al usuario'});
            }
        })
    }
}*/

module.exports ={
    comprar,
    getMyCompras
    //devolver
}