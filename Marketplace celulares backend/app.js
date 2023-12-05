'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var userRoutes = require('./routes/user.routes');
var phoneRoutes = require('./routes/telefono.routes');
var compraRoute = require('./routes/compra.route');

var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

app.use('/api', userRoutes);
app.use('/api', phoneRoutes);
app.use('/api', compraRoute);

module.exports = app;