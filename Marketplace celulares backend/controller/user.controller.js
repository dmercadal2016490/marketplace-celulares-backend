'use strict'

var User = require('../models/user.model');
var Code = require('../models/codigo.model');
var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');
var path = require('path');
var jwt = require('../services/jwt');
const { use } = require('../app');

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

function registrar(req, res){
    var user = new User();
    var params = req.body;
    var emailV = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    if(params.name && params.lastname && params.username && params.password && params.email){
        if(emailV.test(params.email)){
            User.findOne({username: params.username.toLowerCase()}, (err, userFind)=>{
                if(err){
                    res.status(500).send({message: 'Error general al buscar el username'});
                    console.log(err);
                }else if(userFind){
                    res.send({message: 'Nombre de Usuario ya en uso'}); 
                }else{
                    bcrypt.hash(params.password, null, null, (err, passwordHashed)=>{
                        if(err){
                            res.status(500).send({message: 'Error general al encriptar la contraseña'});
                            console.log(err);
                        }else if(passwordHashed){
                            user.name = params.name;
                            user.lastname = params.lastname;
                            user.username = params.username.toLowerCase();
                            user.password = passwordHashed;
                            user.email = params.email.toLowerCase();
                            user.role = 'ROLE_USER'

                            user.save((err,userSaved)=>{
                                if(err){
                                    res.status(500).send({message: 'Error general al crear al usuario'});
                                    console.log(err);
                                }else if(userSaved){
                                    res.send({message: 'Usuario creado exitosamente ', userSaved})
                                }else{
                                    res.status(400).send({message: 'No se guardo el usuario'})
                                }
                            })
                        }else{
                            res.status(400).send({message: 'Contraseña no encriptada'});
                        }
                    })
                }
            })
        }else{
            res.send({message: 'Direccion de correo invalida'});
        }
    }else{
        res.send({message: 'Favor de ingresar todos los campos'});  
    }

}

function login(req, res){
    var params = req.body;

    if(params.username && params.password){
        User.findOne({username: params.username.toLowerCase()}, (err, userFound)=>{
            if(err){
                res.status(500).send({message: 'Error general al buscar al usuario'});
                console.log(err);
            }else if(userFound){
                bcrypt.compare(params.password, userFound.password, (err, passwordChecked)=>{
                    if(err){
                        res.status(500).send({message: 'Error general al verificar contraseña'});
                        console.log(err);
                    }else if(passwordChecked){
                        delete userFound.password;
                        return res.send({token: jwt.createToken(userFound), user: userFound});
                    }else{
                        res.status(400).send({message: 'Contraseña incorrecta'});
                    }
                })
            }else{
                res.status(404).send({message: 'Nombre de usuario o contraseña incorrectos'});
            }
        })
    }else{
        res.status(401).send({message: 'Por favor ingresa tu username y contraseña'});
    }
}

function deleteUser(req,res){
    var userId = req.params.idU;
    var params = req.body;

    if(userId != req.user.sub){
        res.status(403).send({message: 'No tienes permisos para eliminar a otro usuario'});
    }else{
        User.findById(userId, (err, userFind)=>{
            if(err){
                res.status(500).send({message: 'Error general al buscar al usuario'});
                console.log(err);
            }else if(userFind){
                if(params.password){
                    bcrypt.compare(params.password, userFind.password, (err, passwordChecked)=>{
                        if(err){
                            res.status(500).send({message: 'Error general al buscar contraseña'});
                            console.log(err)
                        }else if(passwordChecked){
                            User.findByIdAndRemove(userFind, (err, userDeleted)=>{
                                if(err){
                                    res.status(500).send({message: 'Error general al eliminar el usuario'});
                                    console.log(err)
                                }else if(userDeleted){
                                    res.send({message: 'Usuario eliminado exitosamente'});
                                }else{
                                    res.status(401).send({message: 'No se elimino al usuario'});
                                }
                            })
                        }else{
                            res.status(401).send({message: 'Contraseña incorrecta'})
                        }
                    })
                }else{
                    res.send({message: 'Porfavor introduce tu contraseña'});
                }
            }else{
                res.status(404).send({message: 'El usuario que quieres eliminar no existe'});
            }
        })
    }
}

function updateUser(req,res){
    var userId = req.params.idU;
    var params = req.body;
    var emailV = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    if(userId != req.user.sub){
        res.status(403).send({message: 'No tienes permisos para editar a otro usuario'});
    }else{
        if(params.email){
            if(emailV.test(params.email)){
                if(params.username){
                    User.findOne({username: params.username.toLowerCase()},(err, userFound)=>{
                        if(err){
                            res.status(500).send({message: 'Error general al buscar el usuario'});
                            console.log(err);
                        }else if(userFound){
                            res.send({message: 'Nombre de usuario ya en uso'});
                        }else{
                            User.findByIdAndUpdate(userId, params, {new: true}, (err, userUpdated)=>{
                                if(err){
                                    res.status(500).send({message: 'Error general al actualizar el usuario'});
                                    console.log(err);
                                }else if(userUpdated){
                                   res.send({message: 'Usuario actualizado', userUpdated}); 
                                }else{
                                    res.status(401).send({message: 'No se actualizo el usuario'});
                                }
                            })
                        }
                    })
                }else{
                    User.findByIdAndUpdate(userId, params, {new: true}, (err, userUpdated)=>{
                        if(err){
                            res.status(500).send({message: 'Error general al actualizar el usuario'});
                            console.log(err);
                        }else if(userUpdated){
                           res.send({message: 'Usuario actualizado', userUpdated}); 
                        }else{
                            res.status(401).send({message: 'No se actualizo el usuario'});
                        }
                    }) 
                }
            }else{
                res.send({message: 'Direccion de correo invalida'}); 
            }
        }else{
            if(params.username){
                User.findOne({username: params.username.toLowerCase()},(err, userFound)=>{
                    if(err){
                        res.status(500).send({message: 'Error general al buscar el usuario'});
                        console.log(err);
                    }else if(userFound){
                        res.send({message: 'Nombre de usuario ya en uso'});
                    }else{
                        User.findByIdAndUpdate(userId, params, {new: true}, (err, userUpdated)=>{
                            if(err){
                                res.status(500).send({message: 'Error general al actualizar el usuario'});
                                console.log(err);
                            }else if(userUpdated){
                               res.send({message: 'Usuario actualizado', userUpdated}); 
                            }else{
                                res.status(401).send({message: 'No se actualizo el usuario'});
                            }
                        })
                    }
                })
            }else{
                User.findByIdAndUpdate(userId, params, {new: true}, (err, userUpdated)=>{
                    if(err){
                        res.status(500).send({message: 'Error general al actualizar el usuario'});
                        console.log(err);
                    }else if(userUpdated){
                       res.send({message: 'Usuario actualizado', userUpdated}); 
                    }else{
                        res.status(401).send({message: 'No se actualizo el usuario'});
                    }
                }) 
            }
        }
    }
}

function generarCodigo(req, res){
    var code = new Code();
    const generateRandomString =
    (num) => {
      const characters =
          'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result1 = Math.random().toString(36).substring(0, num);

      return result1;
    }

    var resultado = generateRandomString(6);
    Code.findOne({codigo : resultado}, (err, codigoFound)=>{
        if(err){
            res.status(500).send({mesaage: 'Error general al buscar el codigo'});
            console.log(err);
        }else if(codigoFound){
            res.send({message: 'Codigo ya en uso'});
        }else{
            code.codigo = resultado;

            code.save((err, codeSaved)=>{
                if(err){
                    res.status(500).send({mesaage: 'Error general al guardar el codigo'});
                    console.log(err);
                }else if(codeSaved){
                    res.send({mesaage: 'Codigo: ', resultado})
                }else{
                    res.send({mesaage: 'No se guardo el codigo'});
                }
            })
        }
    })
}

function cambiarContra(req,res){
    var userId = req.params.idU;
    var params = req.body;

    if(userId != req.user.sub){
        res.status(403).send({message: 'No tienes permisos para cambiar la contraseña de otro usuario'});
    }else{
        if(params.password){
            if(params.codigo){
                Code.findOne({codigo: params.codigo}, (err, codeFound)=>{
                    if(err){
                        res.status(500).send({mesaage: 'Error general al buscar el codigo'});
                        console.log(err);
                    }else if(codeFound){
                        User.findById(userId, (err, userFound)=>{
                            if(err){
                                res.status(500).send({mesaage: 'Error general al buscar el usuario'});
                                console.log(err);
                            }else if(userFound){
                                bcrypt.hash(params.password, null, null, (err, passwordHashed)=>{
                                    if(err){
                                        res.status(500).send({mesaage: 'Error general al encriptar la contraseña'});
                                        console.log(err);  
                                    }else if(passwordHashed){
                                        User.findByIdAndUpdate(userId, {password: passwordHashed}, {new:true}, (err, passwordUpdated)=>{
                                            if(err){
                                                res.status(500).send({mesaage: 'Error general al guardar la contraseña'});
                                                console.log(err);
                                            }else if(passwordUpdated){
                                                res.send({mesaage: 'Contraseña actualizada: ', passwordUpdated});
                                                Code.findOneAndDelete({codigo: params.codigo}, (err, codeDeleted)=>{
                                                    if(err){
                                                        res.status(500).send({mesaage: 'Error general al eliminar el codigo'});
                                                        console.log(err);
                                                    }else if(codeDeleted){
                                                        console.log('Codigo Eliminado');
                                                    }else{
                                                        res.status(401).send({mesaage: 'No se elimino el codigo'});
                                                    }
                                                })
                                            }else{
                                                res.status(401).send({mesaage: 'No se guardo la contraseña'})
                                            }
                                        })
                                    }else{
                                        res.status(401).send({mesaage: 'No se encripto la contraseña'});
                                    }
                                })
                            }else{
                                res.status(404).send({mesaage: 'No se econtro al usuario'});
                            }
                        })
                    }else{
                        res.status(404).send({mesaage: 'Codigo incorrecto'})
                    }
                })
            }else{
                res.send({mesaage: 'Porfavor introduce el codigo'})
            }
        }else{
            res.send({message: 'Solo actualizar contraseña'});
        }
    }  
}

function subirImagen(req,res){
    var userId = req.params.id;
    var update = req.body;
    var fileName;

    if(userId != req.user.sub){
        res.status(403).send({message: 'No tienes permisos para cambiar la foto de otro usuario'});
    }else{
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
                    User.findByIdAndUpdate(userId, {image: fileName}, {new:true}, (err, userUpdated)=>{
                        if(err){
                            res.status(500).send({message: 'Error general'});
                        }else if(userUpdated){
                            res.send({user: userUpdated, userImage:userUpdated.image});
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
    }
}

function getImage(req,res){
    var fileName = req.params.fileName;
    var pathFile = './uploads/user/' + fileName;

    fs.exists(pathFile, (exists)=>{
        if(exists){
            res.sendFile(path.resolve(pathFile));
        }else{
            res.status(404).send({message: 'Imagen inexistente'});
        }
    })
}

function getUsers(req, res){
    User.find({}).exec((err, users)=>{
        if(err){
            res.status.send({message: 'Error general al buscar usuarios'});
            console.log(err);
        }else if(users){
            res.send({message: 'Usuarios encontrados: ', users});
        }else{
            res.status(404).send({message: 'No se encontraron usuarios'});
        }
    })
}


module.exports={
    crearAdmin,
    registrar,
    login,
    subirImagen,
    getImage,
    getUsers, 
    deleteUser,
    updateUser,
    generarCodigo,
    cambiarContra
}