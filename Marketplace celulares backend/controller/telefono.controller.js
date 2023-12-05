'use strict'

var Phone = require('../models/telefono.model');
var User = require('../models/user.model');
var Transaccion = require('../models/transaccion.model');
var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');
var path = require('path');
var jwt = require('../services/jwt');
const { use } = require('../app');
const { measureMemory } = require('vm');

function addPhone(req,res){
    var params = req.body;
    var phone = new Phone();
    var transaccion = new Transaccion();
    var userId = req.params.idU;

    if(params.marca && params.serie && params.procesador && params.ram && params.bateria && params.precio && params.unidades){
            /*phone.marca = params.marca;
            phone.serie = params.serie;
            phone.procesador = params.procesador;
            phone.ram = params.ram + 'GB';
            phone.bateria = params.bateria + 'GHZ';
            phone.precio = params.precio;
            phone.unidades = params.unidades;
            phone.publicado = Date.now();*/
    
            User.findById(userId, (err, userFound)=>{
                if(err){
                    res.status(500).send({message: 'Error general al buscar al usuario'});
                    console.log(err);
                }else if(userFound){
                    phone.marca = params.marca;
                    phone.serie = params.serie;
                    phone.procesador = params.procesador;
                    phone.ram = params.ram + ' GB';
                    phone.bateria = params.bateria + ' GHZ';
                    phone.precio = params.precio;
                    phone.unidades = params.unidades;
                    phone.publicado = Date.now();

                    phone.save((err, phoneSaved)=>{
                        if(err){
                            res.status(500).send({message: 'Error general al crear el telefono'});
                            console.log(err);
                        }else if(phoneSaved){
                            Phone.findByIdAndUpdate(phoneSaved._id, {$push:{vendedor: userFound._id}}, {new: true}, (err, userPushed)=>{
                                if(err){
                                    res.status(500).send({message: 'Error general al agregar el usuario'});
                                    console.log(err);
                                }else if(userPushed){
                                    res.send({message: 'Telefono creado', userPushed});
                                    transaccion.fechaPublicacion = Date.now();
                                    transaccion.tipoTransaccion = 'Venta';
                                    transaccion.telefono = params.marca +' '+params.serie;
                                    transaccion.usuario = userFound.username;
        
                                    transaccion.save((err, transaccionSaved)=>{
                                        if(err){
                                            res.status(500).send({message: 'Error general al guardar la transaccion'});
                                            console.log(err);
                                        }else if(transaccionSaved){
                                            console.log('Transaccion guardada');
                                        }else{
                                            res.send({message: 'No se guardo la transaccion'});
                                        }
                                    })        
                                }else{
                                    res.send({message: 'No se agrego al usuario'});
                                }
                            })
                        }else{
                            res.send({message: 'No se guardo el telefono'})
                        }
                    })
                }else{
                    res.status(404).send({message: 'No se encontro el usuario'});
                }
            })
            
        }else{
            res.send({message: 'Favor de ingresar todos los campos'});
        }
    }

function deletePhone(req, res){
    var userId = req.params.idU;
    var phoneId = req.params.idP;
    var transaccion = new Transaccion();

    Phone.findById(phoneId, (err, phoneFound)=>{
        if(err){
            res.status(500).send({message: 'Error general al buscar el telefono'});
            console.log(err);
        }else if(phoneFound){
            if(userId == phoneFound.vendedor){
                Phone.findByIdAndRemove(phoneId, (err, phoneDeleted)=>{
                    if(err){
                        res.status(500).send({message: 'Error general al eliminar el telefono'});
                        console.log(err);
                    }else if(phoneDeleted){
                        res.send({message: 'Telefono eliminado'});
                        //Buscar Usuario para transaccion
                        User.findById(userId, (err, userFound)=>{
                            if(err){
                                res.status(500).send({message: 'Error general al buscar al usuario'});
                                console.log(err);
                            }else if(userFound){
                                    transaccion.fechaPublicacion = Date.now();
                                    transaccion.tipoTransaccion = 'Eliminación';
                                    transaccion.telefono = phoneDeleted.marca +' '+phoneDeleted.serie;
                                    transaccion.usuario = userFound.username;
                                    //Guardar transaccion
                                    transaccion.save((err, transaccionSaved)=>{
                                        if(err){
                                            res.status(500).send({message: 'Error general al guardar la transaccion'});
                                            console.log(err);
                                        }else if(transaccionSaved){
                                            console.log('Transaccion guardada');
                                        }else{
                                            res.send({message: 'No se guardo la transaccion'});
                                        }
                                    })
                            }else{
                                res.status(404).send({message: 'No se encontro el usuario'});
                            }
                        })
                    }else{
                        res.send({message: 'No se elimino el telefono'});
                    }
                })
            }else{
                res.send({message: 'No puedes eliminar este telefono'})
            }
        }else{
            res.status(404).send({message: 'No se encontro el telefono'});
        }
    })
}

function updatePhone(req,res){
    var userId = req.params.idU;
    var phoneId = req.params.idP;
    var params = req.body;
    var transaccion = new Transaccion();

    Phone.findById(phoneId, (err, phoneFound)=>{
        if(err){
            res.status(500).send({message: 'Error general al buscar el telefono'});
            console.log(err);
        }else if(phoneFound){
            if(userId == phoneFound.vendedor){
                Phone.findByIdAndUpdate(phoneId, params, {new:true}, (err, phoneUpdated)=>{
                    if(err){
                        res.status(500).send({message: 'Error general al editar el telefono'});
                        console.log(err);
                    }else if(phoneUpdated){
                        res.send({message: 'Telefono actualizado ', phoneUpdated});

                        //Buscar Usuario para transaccion
                        User.findById(userId, (err, userFound)=>{
                            if(err){
                                res.status(500).send({message: 'Error general al buscar al usuario'});
                                console.log(err);
                            }else if(userFound){
                                    transaccion.fechaPublicacion = Date.now();
                                    transaccion.tipoTransaccion = 'Edición';
                                    transaccion.telefono = phoneUpdated.marca +' '+phoneUpdated.serie;
                                    transaccion.usuario = userFound.username;
                                    //Guardar transaccion
                                    transaccion.save((err, transaccionSaved)=>{
                                        if(err){
                                            res.status(500).send({message: 'Error general al guardar la transaccion'});
                                            console.log(err);
                                        }else if(transaccionSaved){
                                            console.log('Transaccion guardada');
                                        }else{
                                            res.send({message: 'No se guardo la transaccion'});
                                        }
                                    })
                            }else{
                                res.status(404).send({message: 'No se encontro el usuario'});
                            }
                        })
                    }else{
                        res.send({message: 'No se actualizo el telefono'})
                    }
                })
            }else{
                res.send({message: 'No puedes actualizar este telefono'})
            }
        }else{
            res.status(404).send({message: 'No se encontro el telefono'});
        }
    })
}

function phoneImage(req,res){
    var userId = req.params.idU;
    var phoneId = req.params.idP;

    Phone.findById(phoneId, (err, phoneFound)=>{
        if(err){
            res.status(500).send({message: 'Error general al buscar el telefono'});
            console.log(err);
        }else if(phoneFound){
            if(userId == phoneFound.vendedor){
                if(req.files){
                    var filePath = req.files.image.path;
                    var fileSplit = filePath.split('\\');
                    var fileName = fileSplit[2];
                    var extension = fileName.split('\.');
                    var fileExt = extension[1];
        
                    if( fileExt == 'png' ||
                        fileExt == 'PNG' ||
                        fileExt == 'jpg' ||
                        fileExt == 'jpeg' ||
                        fileExt == 'gif'){
                            Phone.findByIdAndUpdate(phoneId, {image: fileName}, {new:true}, (err, phoneUpdated)=>{
                                if(err){
                                    res.status(500).send({message: 'Error general'});
                                }else if(phoneUpdated){
                                    res.send({phone: phoneUpdated, phoneImage:phoneUpdated.image});
                                }else{
                                    res.status(400).send({message: 'No se ha podido actualizar'});
                                }
                            })
                    }else{
                        fs.unlink(filePath, (err)=>{
                            if(err){
                                res.status(500).send({message: 'Extensión no válida y error al eliminar archivo'});
                            }else{
                                res.send({message: 'Extensión no válida'})
                            }
                        })
                    }
                }else{
                    res.status(400).send({message: 'No hay archivo para subir'});
                }
            }else{
                res.send({message: 'No puedes actualizar este telefono'})
            }
        }else{
            res.status(404).send({message: 'No se encontro el telefono'});
        }
    })
}

function getImage(req,res){
    var fileName = req.params.fileName;
    var pathFile = './uploads/phone/' + fileName;

    fs.exists(pathFile, (exists)=>{
        if(exists){
            res.sendFile(path.resolve(pathFile));
        }else{
            res.status(404).send({message: 'Imagen inexistente'});
        }
    })
}

function getPhones(req, res){
    Phone.find({}).exec((err, phones)=>{
        if(err){
            res.status.send({message: 'Error general al buscar telefonos'});
            console.log(err);
        }else if(phones){
            res.send({message: 'Telefonos disponibles: ', phones});
        }else{
            res.status(404).send({message: 'No se encontraron telefonos'});
        }
    })
}

function deleteTransaccion(req,res){
    var userId = req.params.idU;
    var transId = req.params.idT;

    if(userId != req.user.sub){
        res.status(403).send({message: 'No tienes permisos para eliminar una transaccion'});
    }else{
        Transaccion.findById(transId, (err, transFound)=>{
            if(err){
                res.status(500).send({message: 'Error general al buscar la transaccion'});
                console.log(err);
            }else if(transFound){
                Transaccion.findByIdAndRemove(transId, (err, transDeleted)=>{
                    if(err){
                        res.status(500).send({message: 'Error general al eliminar la transaccion'});
                        console.log(err);
                    }else if(transDeleted){
                        res.send({message: 'Transaccion eliminada'});
                    }else{
                        res.send({message: 'No se elimino la transaccion'});
                    }
                })
            }else{
                res.status(404).send({message: 'No se encontro la transaccion'});
            }
        })
    }
}

module.exports={
    addPhone,
    deletePhone,
    getPhones,
    updatePhone,
    phoneImage,
    getImage,
    deleteTransaccion
}