require('dotenv').config();
const express = require('express');
const cors = require('cors');
var bodyParser = require('body-parser');
var login = require('./login');
var register = require('./register');
var student = require('./student');
var schedule = require('./schedule');
require('./db'); //Do not delete
var admin = require('./admin');
var jwt = require('express-jwt');
const app = express();

app.use(cors());

app.use(bodyParser.json())

app.use(function(req, res, next) {
    console.log(req.method + " Request made to: " + req.url);
    next();
});

app.use('/login', login);
app.use('/register', register);

app.use(jwt({ secret: global.jwtsecret, algorithms: ['HS256'] }));

app.use('/student', student);

app.use('/schedule', schedule);

app.use('/admin', admin);



app.listen(3000, 'localhost', function(err) {
    if (err) {
        console.log(err);
        return;
    }
})
console.log("Server listening to: localhost:3000")