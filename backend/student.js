var express = require('express');
var router = express.Router();
var util = require('./util');
var bcrypt = require('bcryptjs');

router.get('/', (req, res) => { 
    res.status = 200;
    res.end("Student route: Alive");
});

router.get('/availabilities', async (req, res) => { 
    if(!req.user)
    {
        res.statusCode = 401;
        res.send("No token provided");
        return;
    }
    if(req.user.admin) {
        res.statusCode = 401;
        res.send("Admins cannot use student route");
        return;
    }
    var studentID = req.user.StudentID;
    var sql = 'select * from availability where studentid="'+studentID+'" and semester='+util.getCurrentSemester();
    var queryPromise = util.executeQuery(sql);
    queryPromise.then((result) => {
        result.forEach(r =>{
            r.Block = util.blockToTime(r.Block);
        });
        res.statusCode = 200;
        res.end(JSON.stringify(result));
    });
});


router.post('/availabilities', async (req, res,) => {
    if(!req.user)
    {
        res.statusCode = 401;
        res.send("No token provided");
        return;
    }
    if(req.user.admin) {
        res.statusCode = 401;
        res.send("Admins cannot use student route");
        return;
    }
    var avail = req.body.data;
    var studentID = req.user.StudentID;
    var currentSemester = util.getCurrentSemester();
    if(avail.availabilities === undefined){
        res.statusCode = 400;
        res.send({message: "Bad Request"});
        return;
    }
    else{
        var sql = 'delete from availability where StudentID="' + studentID + '" and Semester='+currentSemester;
        var result = await util.executeQuery(sql)
        avail.availabilities.forEach(e => {
            sql = 'insert into availability values("'+studentID+'",'+currentSemester+', '+e.day+', '+e.block+', "'+e.desc+'")';
            util.executeQuery(sql);//Append new row
        });
        res.statusCode = 200;
        res.send({message: "Success"});
    }
});


router.get('/info', async (req, res) => { 
    if(!req.user)
    {
        res.statusCode = 401;
        res.send("No token provided");
        return;
    }
    if(req.user.admin) {
        res.statusCode = 401;
        res.send("Admins cannot use student route");
        return;
    }
    var studentID = req.user.StudentID;
    var sql = 'select * from student where studentid="'+studentID+'"';
    var queryPromise = util.executeQuery(sql);
    queryPromise.then((result) => {
        res.statusCode = 200;
        res.end(JSON.stringify(result));
    });
});

router.post('/info', async (req, res) => { 
    if(!req.user)
    {
        res.statusCode = 401;
        res.send("No token provided");
        return;
    }
    if(req.user.admin) {
        res.statusCode = 401;
        res.send("Admins cannot use student route");
        return;
    }
    var studentID = req.user.StudentID;
    var info = req.body.data;
    var sql = '';
    if(info.Password){
        var hashedPassword = bcrypt.hashSync(info.Password, bcrypt.genSaltSync(10));
        sql = 'update student set CellPhone="'+info.CellPhone+'", Email="'+info.Email+'", Password="'+hashedPassword+'" where Studentid="'+studentID+'"';
    }
    else{
        sql = 'update student set CellPhone="'+info.CellPhone+'", Email="'+info.Email+'" where Studentid="'+studentID+'"';
    }
    var queryPromise = util.executeQuery(sql);
    queryPromise.then((result) => {
        res.statusCode = 200;
        res.end(JSON.stringify(result));
    });
});


module.exports = router;