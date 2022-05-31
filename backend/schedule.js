var express = require('express');
var util = require('./util');
var router = express.Router();

router.get('/', async function (req, res) {
    if (!req.user) {
        res.statusCode = 401;
        res.send("No token provided");
        return;
    }
    if (!req.user.admin) {
        res.statusCode = 401;
        res.send("Students cannot use student route");
        return;
    }
    var studPerRel = req.query.studPerRel;
    if (studPerRel === undefined) {
        res.statusCode = 400;
        res.send({ message: "No Student Per Relationiste provided" });
        return;
    }
    var schedule = await util.generateSchedule(studPerRel);
    if (schedule) {
        res.statusCode = 200;
        res.send({ schedule: schedule });
    }
});

router.post('/selectSchedule', async function (req, res) {
    if (!req.user) {
        res.statusCode = 401;
        res.send("No token provided");
        return;
    }
    if (!req.user.admin) {
        res.statusCode = 401;
        res.send("Students cannot use student route");
        return;
    }

    var schedule = req.body.schedule;
    console.log(schedule);
    if (schedule == undefined || schedule.length <= 1 || schedule[0].Day == undefined)
        return;

    var result = await util.executeQuery('insert into scheduleproposal values(NULL, ' + util.getCurrentSemester() + ', "Current Schedule", true)');
    if (!result)
        return;

    var queryPromise = util.executeQuery('select SchPNo from scheduleproposal where SchPSemester='+util.getCurrentSemester()+' and SchPChosen=true');
    queryPromise.then((result) => {
        var schedID = result[0].SchPNo;
        var sql = "";
        schedule.forEach(e => {
            sql = 'insert into scheduleproposaldetail values('+schedID+', '+e.Day+', '+util.timeToBlock(e.Block)+', "'+e.Student+'")';
            util.executeQuery(sql);
        });
    });

    res.statusCode = 200;
    res.send({ message: "Success" });
});

module.exports = router;