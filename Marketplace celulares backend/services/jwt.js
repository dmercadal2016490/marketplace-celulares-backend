'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secretKey = 'encriptacion-Mercadal';

exports.createToken = (user)=>{
    var payload = {
        sub: user._id,
        cui: user.cui,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        iat: moment().unix(),
        exp: moment().add(8, 'hours').unix()
    }
    return jwt.encode(payload, secretKey);
}