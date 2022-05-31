var express = require('express');
var jwt = require('jsonwebtoken');
const { executeQuery, getCurrentSemester } = require('./util');
const bcrypt = require('bcryptjs');


var router = express.Router();

router.post('/', async function (req, res) {
    var studentID = req.body.StudentID;
    var password = req.body.Password;

    //Verify user
    var result = await executeQuery(`
        select Password,
        (
            select jobid 
            from assignation 
            where assignation.studentid=student.StudentID
            and (assignation.semester=`+getCurrentSemester()+` or assignation.semester=-1) limit 1
        ) as jobid 
        from student 
        where StudentID='`+studentID+`'
    `);
    if (result === undefined || result.length != 1 || result[0].jobid === undefined || result[0].jobid == null) {
        res.statusCode = 401;
        console.log(result)
        res.send({ message: "Unauthorized" });
        return;
    }
    var dbPAssword = result[0].Password;
    var jobid = result[0].jobid;
    bcrypt.compare(password, dbPAssword, function (err, result) {
        if (!result) {
            res.statusCode = 401;
            res.send({ message: "Unauthorized" });
            return;
        }
        else {
            var isAdmin = jobid == 4;
            var token = jwt.sign({ StudentID: studentID, admin: isAdmin }, global.jwtsecret, { expiresIn: '3h' });
            res.statusCode = 200;
            res.send({ token: token, studentID: studentID, admin: isAdmin });
        }
    });
});

module.exports = router;