var mysql = require('mysql2');
global.jwtsecret = 'secret';
global.dbpool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'cleo'
});