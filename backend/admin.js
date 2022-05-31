var express = require('express');
var router = express.Router();
var util = require('./util');
const puppeteer = require('puppeteer');

router.get('/students', async function (req, res) {
    if(!req.user)
    {
        res.statusCode = 401;
        res.send("No token provided");
        return;
    }
    if(!req.user.admin) {
        res.statusCode = 401;
        res.send("Students cannot use student route");
        return;
    }
    //Queries the students that DONT have the jobid=4 / students that are not admins AND are active
    var students = await util.executeQuery(`
    select 
        StudentID, 
        LastName,
        FirstName,
        CellPhone,
        Email
    from 
        student 
    where 
        (
            select count(*) 
            from assignation 
            where assignation.studentid=student.StudentID 
            and assignation.JobID=4
        ) = 0 
        and 
        (
            select count(*)
            from assignation
            where assignation.studentid=student.StudentID
            and assignation.JobID<>4
            and assignation.Semester = `+util.getCurrentSemester()+`
        ) > 0
        and Password is not null
    `);
    if (students === undefined) {
        res.statusCode = 400;
        res.send({ message: "No Students" });
        return;
    }
    res.statusCode = 200;
    res.send(students);
});

router.get('/students/inactive', async function (req, res) {
    if(!req.user)
    {
        res.statusCode = 401;
        res.send("No token provided");
        return;
    }
    if(!req.user.admin) {
        res.statusCode = 401;
        res.send("Students cannot use student route");
        return;
    }
    //Queries the students that DONT have the jobid=4 / students that are not admins AND that are not active
    var students = await util.executeQuery(`
    select 
        StudentID, 
        LastName,
        FirstName,
        CellPhone,
        Email
    from 
        student 
    where 
        (
            select count(*) 
            from assignation 
            where assignation.studentid=student.StudentID 
            and assignation.JobID=4
        ) = 0 
        and 
        (
            select count(*)
            from assignation
            where assignation.studentid=student.StudentID
            and assignation.JobID<>4
            and assignation.Semester = `+util.getCurrentSemester()+`
        ) = 0
        and Password is not null
    `);    
    if (students === undefined) {
        res.statusCode = 400;
        res.send({ message: "No Students" });
        return;
    }
    res.statusCode = 200;
    res.send(students);
});


router.delete('/student', async function (req, res) {
    if(!req.user)
    {
        res.statusCode = 401;
        res.send("No token provided");
        return;
    }
    if(!req.user.admin) {
        res.statusCode = 401;
        res.send("Students cannot use student route");
        return;
    }
    var studentID = req.query.studentid;
    if (studentID === undefined) {
        res.statusCode = 400;
        res.send({ message: "No Student ID provided" });
        return;
    }
    //Delete student from DB. Cascades to Assignation and Availabilities
    await util.executeQuery(`
        delete from Student where StudentID='`+studentID+`'
    `);    
    res.statusCode = 200;
    res.end();
});

router.post('/student/inactive', async function (req, res) {
    if(!req.user)
    {
        res.statusCode = 401;
        res.send("No token provided");
        return;
    }
    if(!req.user.admin) {
        res.statusCode = 401;
        res.send("Students cannot use student route");
        return;
    }
    var studentID = req.query.studentid;
    if (studentID === undefined) {
        res.statusCode = 400;
        res.send({ message: "No Student ID provided" });
        return;
    }
    //Removes every assignation for current semester and student
    await util.executeQuery(`
        delete from assignation where StudentID='`+studentID+`' and Semester=`+util.getCurrentSemester()+`
    `);    
    res.statusCode = 200;
    res.end();
});

router.post('/student/active', async function (req, res) {
    if(!req.user)
    {
        res.statusCode = 401;
        res.send("No token provided");
        return;
    }
    if(!req.user.admin) {
        res.statusCode = 401;
        res.send("Students cannot use student route");
        return;
    }
    var studentID = req.query.studentid;
    if (studentID === undefined) {
        res.statusCode = 400;
        res.send({ message: "No Student ID provided" });
        return;
    }
    //Adds a dummy Student assignation for current semester, thus making student count as active
    await util.executeQuery(`
        insert into assignation(Semester, StudentID, JobID) values(`+util.getCurrentSemester()+`, '`+studentID+`', 5)
    `);    
    res.statusCode = 200;
    res.end();
});

router.post('/student/add', async function (req, res) {
    if(!req.user)
    {
        res.statusCode = 401;
        res.send("No token provided");
        return;
    }
    if(!req.user.admin) {
        res.statusCode = 401;
        res.send("Students cannot use student route");
        return;
    }
    var studentID = req.query.studentid;
    if (studentID === undefined) {
        res.statusCode = 400;
        res.send({ message: "No Student ID provided" });
        return;
    }
    //Adds a student with no data except student number
    await util.executeQuery(`
        insert into student values ('`+studentID+`', null, null, null, null, null)
    `);    
    res.statusCode = 200;
    res.end();
});

router.get('/students/unregistered', async function (req, res) {
    if(!req.user)
    {
        res.statusCode = 401;
        res.send("No token provided");
        return;
    }
    if(!req.user.admin) {
        res.statusCode = 401;
        res.send("Students cannot use student route");
        return;
    }
    //Adds a student with no data except student number
    var students = await util.executeQuery(`
        select 
            StudentID, 
            LastName,
            FirstName,
            CellPhone,
            Email
        from 
            student 
        where 
            password is null
    `);    
    if (students === undefined) {
        res.statusCode = 400;
        res.send({ message: "No Students" });
        return;
    }
    res.statusCode = 200;
    res.send(students);
});


router.get('/availabilities', async function (req, res) {
    if(!req.user)
    {
        res.statusCode = 401;
        res.send("No token provided");
        return;
    }
    if(!req.user.admin) {
        res.statusCode = 401;
        res.send("Students cannot use student route");
        return;
    }
    var studentID = req.query.studentid;
    if (studentID === undefined) {
        res.statusCode = 400;
        res.send({ message: "No Student ID provided" });
        return;
    }

    var availabilities = await util.executeQuery('select * from availability where StudentID="' + studentID + '" and Semester=' + util.getCurrentSemester());
    if (availabilities === undefined || availabilities.length < 1) {
        res.statusCode = 400;
        res.send({ message: "No availabilities for student" });
        return;
    }
    res.statusCode = 200;
    res.send(availabilities);
});

router.post('/availabilities', async function (req, res) {
    if(!req.user)
    {
        res.statusCode = 401;
        res.send("No token provided");
        return;
    }
    if(!req.user.admin) {
        res.statusCode = 401;
        res.send("Students cannot use student route");
        return;
    }
    var studentID = req.query.studentid;
    if (studentID === undefined) {
        res.statusCode = 400;
        res.send({ message: "No Student ID provided" });
        return;
    }
    else {
        var avail = req.body.data;
        var currentSemester = util.getCurrentSemester();
        if (avail.availabilities === undefined) {
            res.statusCode = 400;
            res.send({message: "Bad Request"});
            return;
        }
        else {
            var sql = 'delete from availability where StudentID="' + studentID + '" and Semester=' + currentSemester;
            var result = await util.executeQuery(sql);
            avail.availabilities.forEach(e => {
                sql = 'insert into availability values("' + studentID + '",' + currentSemester + ', ' + e.day + ', ' + e.block + ', "' + e.desc + '")';
                util.executeQuery(sql);//Append new row
            });
            res.statusCode = 200;
            res.send({ message: "Success" });
        }
    }
});

router.get('/roles', async function (req, res) {
    if(!req.user)
    {
        res.statusCode = 401;
        res.send("No token provided");
        return;
    }
    if(!req.user.admin) {
        res.statusCode = 401;
        res.send("Students cannot use student route");
        return;
    }
    var studentID = req.query.studentid;
    if (studentID === undefined) {
        res.statusCode = 400;
        res.send({ message: "No Student ID provided" });
        return;
    }

    var availabilities = await util.executeQuery("select * from assignation where Semester="+util.getCurrentSemester()+" and StudentID='"+studentID+"'");
    res.statusCode = 200;
    res.send(availabilities);
});


router.get('/schedule', async function (req, res){
    if(!req.user)
    {
        res.statusCode = 401;
        res.send("No token provided");
        return;
    }
    if(!req.user.admin) {
        res.statusCode = 401;
        res.send("Students cannot use student route");
        return;
    }

    var schedule = await util.executeQuery(`
    select   
	    a.StudID 					as StudentID,
	    a.SProDay 					as Day,
	    a.SProBlock 				as Block,
	    if(dup.dupeCount = 1, 0, 1) as isOverlap
    from
	    scheduleproposaldetail a
    left outer join 
	(
		select 
			SProDay, 
			SProBlock, 
			count(*) dupeCount
		from 
			scheduleproposaldetail 
		group by 
			SProDay, 
			SProBlock
	) dup on dup.SProDay = a.SProDay and dup.SProBlock = a.SProBlock
    where
	    SchPNo = (select SchPNo from scheduleproposal where SchPSemester='`+util.getCurrentSemester()+`' and SchPChosen = 1)
    `);
    if (schedule === undefined || schedule.length < 1) {
        res.statusCode = 400;
        res.send({ message: "No active schedule" });
        return;
    }
    res.statusCode = 200;
    res.send(schedule);
});

router.delete('/schedule', async function (req, res){
    if(!req.user)
    {
        res.statusCode = 401;
        res.send("No token provided");
        return;
    }
    if(!req.user.admin) {
        res.statusCode = 401;
        res.send("Students cannot use student route");
        return;
    }

    await util.executeQuery(`
    delete from
	    scheduleproposaldetail
    where
	    SchPNo = (select SchPNo from scheduleproposal where SchPSemester='`+util.getCurrentSemester()+`' and SchPChosen = 1)
    `);

    await util.executeQuery(`
    delete from
	    scheduleproposal
    where
	    SchPSemester='`+util.getCurrentSemester()+`' and SchPChosen = 1
    `);
    res.statusCode = 200;
    res.end();
});

//Uses Puppeteer, aka chrome headless. This requires a chromium installation
//which gets automatically installed by npm.
//APIs didn't work and jsPdf, wkhtmltopdf and whatnot didn't provide a good render
//IMPORTANT: Download must be sent as application/pdf and downloaded by angular as BLOB
router.post('/printpdf', async function (req, res){
    if(!req.user)
    {
        res.statusCode = 401;
        res.send("No token provided");
        return;
    }
    if(!req.user.admin) {
        res.statusCode = 401;
        res.send("Students cannot use student route");
        return;
    }
    var data = req.body.data;

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(data.html);
    const pdf = await page.pdf({ width: '1500 px', height: '600 px'});
    await browser.close();

    res.contentType("application/pdf");
	res.send(pdf);
});


router.post('/roles', async function (req, res) {
    if(!req.user)
    {
        res.statusCode = 401;
        res.send("No token provided");
        return;
    }
    if(!req.user.admin) {
        res.statusCode = 401;
        res.send("Students cannot use student route");
        return;
    }
    var studentID = req.query.studentid;
    if (studentID === undefined) {
        res.statusCode = 400;
        res.send({ message: "No Student ID provided" });
        return;
    }

    var roleArray = req.body.data.roles;
    

    await util.executeQuery("delete from assignation where Semester="+util.getCurrentSemester()+" and StudentID='"+studentID+"'")

    roleArray.forEach(role =>{
        util.executeQuery("insert into assignation(Semester, StudentID, JobID) values("+util.getCurrentSemester()+", '"+studentID+"', "+role+")");
    });

    res.statusCode = 200;
    res.send({message: "success"});
});

module.exports = router;