'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var userRoutes = require('./routes/user.routes');

var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

app.use('/api', userRoutes)

module.exports = app;