var express = require('express');
const { executeQuery, getCurrentSemester } = require('./util');
const bcrypt = require('bcryptjs');

var router = express.Router();

router.post('/', async function (req, res) {
    var data = req.body;
    
    //Making sure names are not empty
    if(data.firstName.length < 1 || data.lastName < 1){
        res.statusCode = 400;
        res.send({ message: "Nom et Prénom requis" });
        return;
    }else if (!isEmail(data.email)){
        res.statusCode = 400;
        res.send({ message: "Email invalide" });
        return;
    }else if(!isValidPhone(data.cellphone) && data.cellphone.length > 0){
        res.statusCode = 400;
        res.send({ message: "Telephone invalide" });
        return;
    }else if(data.password != data.passwordRepeat){
        res.statusCode = 400;
        res.send({ message: "Les mot de passes ne correspondent pas" });
        return;
    }
    else if(data.password.length < 8){
        res.statusCode = 400;
        res.send({ message: "Mot de passe trop court. 8 charactères minimum." });
        return;
    }
    var emailDupCheck = await executeQuery(`
        select count(*) as count from student where Email = '`+data.email+`'
    `);
    if(emailDupCheck[0].count > 0){
        res.statusCode = 400;
        res.send({ message: "Cet email existe deja" });
        return;
    }

    var studentIDCheck = await executeQuery(`
        select count(*) as count from student where studentid='`+data.studentID+`' and password is null
    `);
    if(studentIDCheck[0].count != 1){
        res.statusCode = 400;
        res.send({ message: "Ce # Étudiant ne peut pas s'inscrire" });
        return;
    }
    //All checks passed, we can register!
    
    var hashedPassword = bcrypt.hashSync(data.password, bcrypt.genSaltSync(10));


    await executeQuery(`
        update 
            student 
        set 
            lastname='`+data.lastName+`',
            firstname='`+data.firstName+`',
            cellphone='`+data.cellphone+`',
            email='`+data.email+`',
            password='`+hashedPassword+`'
        where 
            studentid='`+data.studentID+`'
    `);
    await executeQuery(`
        insert into assignation(Semester, StudentID, JobID) 
        values(`+getCurrentSemester()+`, '`+data.studentID+`', 5)
    `);


    res.statusCode = 200;
    res.send({ message: "Success" });

});

function isEmail(email) {
    var pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/; 
    return email.match(pattern);    
}

function isValidPhone(phone) {
    var pattern = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im; 
    return phone.match(pattern);    
}

module.exports = router;