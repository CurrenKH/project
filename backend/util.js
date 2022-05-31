function executeQuery(sql) {
    console.log("Executing the following query: " + sql);
    return new Promise((resolve, reject) => {
        global.dbpool.query(sql, function (err, result) {
            if (err) reject(err);
            resolve(result);
        });
    });
}

function getCurrentSemester() {
    var now = new Date(Date.now());
    var res = '';
    var winterSemester = [11, 0, 1, 2, 3, 4]; //dec, jan, feb, mar, apr, may
    res += now.getFullYear();
    var semesterno = winterSemester.includes(now.getMonth()) ? '4' : '1';
    res += semesterno;
    return res;
}

//Output format '07:30'
function blockToTime(block) {
    var startTime = new Date('1000-10-10 07:30:00');
    for (let i = 0; i < block; i++) {
        if (i == block - 1)
            return startTime.toLocaleTimeString();
        startTime.setMinutes(startTime.getMinutes() + 30);
    }
}
//Input format '07:30'
function timeToBlock(time) {
    var dateTime = new Date('1000-10-10 ' + time);
    block = 1;
    var startTime = new Date('1000-10-10 07:30:00');
    while (startTime < dateTime) {
        block++;
        startTime.setMinutes(startTime.getMinutes() + 30);
    }
    return block;
}

function reOrderByStudentId(list, studentID) {
    var copiedList = [...list];
    var first = [];
    var returnList = [];
    var done = false;
    copiedList.forEach(student => {
        if (done) {
            returnList.push(student);
        }
        else if (student.studentid == studentID) {
            returnList.push(student);
            done = true;
        }
        else {
            first.push(student);
        }
    });
    returnList.push.apply(returnList, first);
    return returnList;
}

function getBlockTwoDurationInBlocks(studentPerRelationist) {
    switch (studentPerRelationist) {
        case '1':
            return 4;
        case '2':
            return 3;
        default:
            return 2;
    }
}

function tryToFitStudent(currentScore, scoreWorth, day, startBlock, endBlock, schedule, doneIds, student, tutorHour, durationInBlocks, isBlockTwo, canOverlap = false, overlapCounter = 1) {
    //Only fit students that are not already fitted
    if (doneIds.includes(student.studentid)) return;

    //Foreach 30m block in range (dayStart, dayEnd)
    for (let block = startBlock; block <= (endBlock - 2); block++) {
        var blocks = [];
        for (let i = 0; i < durationInBlocks; i++) {
            blocks.push({ Day: day, Block: block + i });
        }
        var blockBlockArray = blocks.map((block) => block.Block);
        if (!canOverlap && schedule.filter(el => {
            return el.Day == day && el.Block && blockBlockArray.includes(el.Block);
        }).length > 0) {
            //Can't schedule for this block, already filled
            continue;
        }
        if (student.availabilities.filter(el => {
            return el.Day == day && el.Block && blockBlockArray.includes(el.Block);
        }).length != 0) {
            //Student not available for this time
            continue;
        }

        if (day == 3 && isBlockTwo && schedule.filter(e => {
            return e.Day == 3, e.Block <= timeToBlock('12:00') && e.Student == student.studentid;
        }).length > 0) {
            //Student is already scheduled for block 1 on wednesday morning
            continue;
        }

        //Manage overlapCounter
        if (canOverlap) {
            var alreadyFilledScheduleFilter = schedule.filter(s => {
                return s.Day == day && blockBlockArray.includes(s.Block) && s.Student != student
            });
            var countOfDiffStudents = 0;
            var countedStudents = [];
            alreadyFilledScheduleFilter.forEach(s => {
                if(!countedStudents.includes(s.Student)){
                    countOfDiffStudents++;
                    countedStudents.push(s.Student);
                }
            });
            if (countOfDiffStudents > overlapCounter)
                continue;
        }

        var pastBlock = block - 1;                                              //Previous block
        var pastPastBlock = block - 2;                                          //Previous previous block
        var futureBlock = blockBlockArray[blockBlockArray.length - 1] + 1;        //Next block
        var futureFutureBlock = blockBlockArray[blockBlockArray.length - 1] + 2;  //Next next block
        var filteredPastSchedule = schedule.filter(e => {
            return e.Day == day && [pastBlock, pastPastBlock].includes(e.Block);
        });
        var filteredFutureSchedule = schedule.filter(e => {
            return e.Day == day && [futureBlock, futureFutureBlock].includes(e.Block);
        });
        //There is a 30m block after, we skip if tutorHour flag is up
        if (tutorHour && futureBlock > 0 && futureFutureBlock > 0 && filteredFutureSchedule.length == 1 && filteredFutureSchedule[0].Block == futureFutureBlock)
            continue;

        //There is a 30m block before, we skip if tutorHour flag is up
        if (tutorHour && pastBlock > 0 && pastPastBlock > 0 && filteredPastSchedule.length == 1 && filteredPastSchedule[0].Block == pastPastBlock)
            continue;

        //Student passed all checks, we can schedule him here
        //Manage score
        currentScore.score = currentScore.score + scoreWorth;

        //Schedule student
        doneIds.push(student.studentid)
        blocks.forEach(bl => {
            schedule.push({ Day: day, Block: bl.Block, Student: student.studentid, isOverlap: canOverlap })
        });
        break;
    }
}

async function generateSchedule(studPerRel) {

    var relationistList = [];
    var currentSemester = getCurrentSemester();
    var availabilities = await executeQuery("select * from availability where semester=" + currentSemester)
    var students = await executeQuery("select studentid from assignation where jobid=3 and semester=" + currentSemester)
    students.forEach(student => {
        var currAvail = [];
        availabilities.forEach(avail => {
            if (avail.StudentID === student.studentid) {
                currAvail.push(avail);
            }
        });
        relationistList.push(
            {
                studentid: student.studentid,
                availabilities: JSON.parse(JSON.stringify(currAvail))
            }
        );
    });

    var schedules = [];
    var schedulesAndScore = []
    var idealBlockStart = timeToBlock('08:30');     //Block included
    var idealBlockEnd = timeToBlock('17:00');       //Block included
    var extendedBlockStart = timeToBlock('07:30');  //Block included
    var extendedBlockEnd = timeToBlock('18:30');    //Block included
    var fridayEnd = timeToBlock('12:00');           //Block included
    var wednesdayEnd = timeToBlock('12:00');        //Block included
    var block2Duration = getBlockTwoDurationInBlocks(studPerRel);
    var scoreForHoles = 5;

    students.forEach(student => {
        var schedule = [];
        var doneIds = [];
        var missingStudents = { block1: [], block2: [] };
        var currentScore = { score: 0 }
        var orderedList = reOrderByStudentId(relationistList, student.studentid);

        //Block 1 with tutor hour
        //Try 1 - Monday Tuesday ideal times
        orderedList.forEach(student => {
            //Monday
            tryToFitStudent(currentScore, 0, 1, idealBlockStart, idealBlockEnd, schedule, doneIds, student, true, 3, false);
            //Tuesday
            tryToFitStudent(currentScore, 0, 2, idealBlockStart, idealBlockEnd, schedule, doneIds, student, true, 3, false);
        });
        //Try 2 Monday Tuesday ideal times + wednesday to 12:30
        orderedList.forEach(student => {
            //Wednesday
            tryToFitStudent(currentScore, 1, 3, idealBlockStart, wednesdayEnd, schedule, doneIds, student, true, 3, false);
        });

        //Try 3 Monday Tuesday extended times
        orderedList.forEach(student => {
            //Monday
            tryToFitStudent(currentScore, 2, 1, extendedBlockStart, extendedBlockEnd, schedule, doneIds, student, true, 3, false);
            //Tuesday
            tryToFitStudent(currentScore, 2, 2, extendedBlockStart, extendedBlockEnd, schedule, doneIds, student, true, 3, false);
        });

        //Try 4 Monday Tuesday extended times + wednesday to 12:30
        orderedList.forEach(student => {
            //Wednesday up to 12:30
            tryToFitStudent(currentScore, 3, 3, extendedBlockStart, wednesdayEnd, schedule, doneIds, student, true, 3, false);
        });

        //Block 1 without tutor hour
        //Try 1 - Monday Tuesday ideal times
        orderedList.forEach(student => {
            //Monday
            tryToFitStudent(currentScore, 1, 1, idealBlockStart, idealBlockEnd, schedule, doneIds, student, 3, false);
            //Tuesday
            tryToFitStudent(currentScore, 1, 2, idealBlockStart, idealBlockEnd, schedule, doneIds, student, 3, false);
        });

        //Try 2 Monday Tuesday ideal times + wednesday to 12:30
        orderedList.forEach(student => {
            //Wednesday
            tryToFitStudent(currentScore, 2, 3, idealBlockStart, wednesdayEnd, schedule, doneIds, student, 3, false);
        });

        //Try 3 Monday Tuesday extended times
        orderedList.forEach(student => {
            //Monday
            tryToFitStudent(currentScore, 3, 1, extendedBlockStart, extendedBlockEnd, schedule, doneIds, student, 3, false);
            //Tuesday
            tryToFitStudent(currentScore, 3, 2, extendedBlockStart, extendedBlockEnd, schedule, doneIds, student, 3, false);
        });

        //Try 4 Monday Tuesday extended times + wednesday to 12:30
        orderedList.forEach(student => {
            //Wednesday up to 12:30
            tryToFitStudent(currentScore, 4, 3, extendedBlockStart, wednesdayEnd, schedule, doneIds, student, 3, false);
        });


        //Block 1 Repeat - With overlap
        //For loop allows max 3 students at the same time, tweak as needed
        //i is passed as the overlapCounter to tryToFitStudent
        for (let i = 1; i <= 3; i++) {
            orderedList.forEach(student => {
                //Monday
                tryToFitStudent(currentScore, 2+i, 1, idealBlockStart, idealBlockEnd, schedule, doneIds, student, true, 3, false, true, i);
                //Tuesday
                tryToFitStudent(currentScore, 2+i, 2, idealBlockStart, idealBlockEnd, schedule, doneIds, student, true, 3, false, true, i);
            });
            //Try 2 Monday Tuesday ideal times + wednesday to 12:30
            orderedList.forEach(student => {
                //Wednesday
                tryToFitStudent(currentScore, 3+i, 3, idealBlockStart, wednesdayEnd, schedule, doneIds, student, true, 3, false, true, i);
            });

            //Try 3 Monday Tuesday extended times
            orderedList.forEach(student => {
                //Monday
                tryToFitStudent(currentScore, 4+i, 1, extendedBlockStart, extendedBlockEnd, schedule, doneIds, student, true, 3, false, true, i);
                //Tuesday
                tryToFitStudent(currentScore, 4+i, 2, extendedBlockStart, extendedBlockEnd, schedule, doneIds, student, true, 3, false, true, i);
            });

            //Try 4 Monday Tuesday extended times + wednesday to 12:30
            orderedList.forEach(student => {
                //Wednesday up to 12:30
                tryToFitStudent(currentScore, 5+i, 3, extendedBlockStart, wednesdayEnd, schedule, doneIds, student, true, 3, false, true, i);
            });

            //Block 1 without tutor hour
            //Try 1 - Monday Tuesday ideal times
            orderedList.forEach(student => {
                //Monday
                tryToFitStudent(currentScore, 3+i, 1, idealBlockStart, idealBlockEnd, schedule, doneIds, student, 3, false, true, i);
                //Tuesday
                tryToFitStudent(currentScore, 3+i, 2, idealBlockStart, idealBlockEnd, schedule, doneIds, student, 3, false, true, i);
            });

            //Try 2 Monday Tuesday ideal times + wednesday to 12:30
            orderedList.forEach(student => {
                //Wednesday
                tryToFitStudent(currentScore, 4+i, 3, idealBlockStart, wednesdayEnd, schedule, doneIds, student, 3, false, true, i);
            });

            //Try 3 Monday Tuesday extended times
            orderedList.forEach(student => {
                //Monday
                tryToFitStudent(currentScore, 3+i, 1, extendedBlockStart, extendedBlockEnd, schedule, doneIds, student, 3, false, true, i);
                //Tuesday
                tryToFitStudent(currentScore, 3+i, 2, extendedBlockStart, extendedBlockEnd, schedule, doneIds, student, 3, false, true, i);
            });

            //Try 4 Monday Tuesday extended times + wednesday to 12:30
            orderedList.forEach(student => {
                //Wednesday up to 12:30
                tryToFitStudent(currentScore, 4+i, 3, extendedBlockStart, wednesdayEnd, schedule, doneIds, student, 3, false, true, i);
            });
        }
        orderedList.forEach(student => {
            if (!doneIds.includes(student.studentid)) {
                missingStudents.block1.push(student.studentid);
            }
        });

        //Block 2
        doneIds = [];
        //Try 1 - Ideal times with tutorHour flag
        orderedList.forEach(student => {
            //Wednesday
            tryToFitStudent(currentScore, 0, 3, idealBlockStart, idealBlockEnd, schedule, doneIds, student, true, block2Duration, true);
            //Thursday
            tryToFitStudent(currentScore, 0, 4, idealBlockStart, idealBlockEnd, schedule, doneIds, student, true, block2Duration, true);
            //Friday
            tryToFitStudent(currentScore, 0, 5, idealBlockStart, fridayEnd, schedule, doneIds, student, true, block2Duration, true);
        });
        //Try 2 - Extended times with tutorHour flag
        orderedList.forEach(student => {
            //Wednesday
            tryToFitStudent(currentScore, 1, 3, extendedBlockStart, extendedBlockEnd, schedule, doneIds, student, true, block2Duration, true);
            //Thursday
            tryToFitStudent(currentScore, 1, 4, extendedBlockStart, extendedBlockEnd, schedule, doneIds, student, true, block2Duration, true);
            //Friday
            tryToFitStudent(currentScore, 1, 5, extendedBlockStart, fridayEnd, schedule, doneIds, student, true, block2Duration, true);
        });
        //Try 3 - Ideal times without tutorHour flag
        orderedList.forEach(student => {
            //Wednesday
            tryToFitStudent(currentScore, 1, 3, idealBlockStart, idealBlockEnd, schedule, doneIds, student, false, block2Duration, true);
            //Thursday
            tryToFitStudent(currentScore, 1, 4, idealBlockStart, idealBlockEnd, schedule, doneIds, student, false, block2Duration, true);
            //Friday
            tryToFitStudent(currentScore, 1, 5, idealBlockStart, fridayEnd, schedule, doneIds, student, false, block2Duration, true);
        });
        //Try 4 - Extended times without tutorHour flag
        orderedList.forEach(student => {
            //Wednesday
            tryToFitStudent(currentScore, 2, 3, extendedBlockStart, extendedBlockEnd, schedule, doneIds, student, false, block2Duration, true);
            //Thursday
            tryToFitStudent(currentScore, 2, 4, extendedBlockStart, extendedBlockEnd, schedule, doneIds, student, false, block2Duration, true);
            //Friday
            tryToFitStudent(currentScore, 2, 5, extendedBlockStart, fridayEnd, schedule, doneIds, student, false, block2Duration, true);
        });



        //Block 2 repeat with overlap
        for (let i = 1; i <= 3; i++) {
            orderedList.forEach(student => {
                //Wednesday
                tryToFitStudent(currentScore, 2+i, 3, idealBlockStart, idealBlockEnd, schedule, doneIds, student, true, block2Duration, true, true, i);
                //Thursday
                tryToFitStudent(currentScore, 2+i, 4, idealBlockStart, idealBlockEnd, schedule, doneIds, student, true, block2Duration, true, true, i);
                //Friday
                tryToFitStudent(currentScore, 2+i, 5, idealBlockStart, fridayEnd, schedule, doneIds, student, true, block2Duration, true, true, i);
            });
            //Try 2 - Extended times with tutorHour flag
            orderedList.forEach(student => {
                //Wednesday
                tryToFitStudent(currentScore, 3+i, 3, extendedBlockStart, extendedBlockEnd, schedule, doneIds, student, true, block2Duration, true, true, i);
                //Thursday
                tryToFitStudent(currentScore, 3+i, 4, extendedBlockStart, extendedBlockEnd, schedule, doneIds, student, true, block2Duration, true, true, i);
                //Friday
                tryToFitStudent(currentScore, 3+i, 5, extendedBlockStart, fridayEnd, schedule, doneIds, student, true, block2Duration, true, true, i);
            });
            //Try 3 - Ideal times without tutorHour flag
            orderedList.forEach(student => {
                //Wednesday
                tryToFitStudent(currentScore, 3+i, 3, idealBlockStart, idealBlockEnd, schedule, doneIds, student, false, block2Duration, true, true, i);
                //Thursday
                tryToFitStudent(currentScore, 3+i, 4, idealBlockStart, idealBlockEnd, schedule, doneIds, student, false, block2Duration, true, true, i);
                //Friday
                tryToFitStudent(currentScore, 3+i, 5, idealBlockStart, fridayEnd, schedule, doneIds, student, false, block2Duration, true, true, i);
            });
            //Try 4 - Extended times without tutorHour flag
            orderedList.forEach(student => {
                //Wednesday
                tryToFitStudent(currentScore, 4+i, 3, extendedBlockStart, extendedBlockEnd, schedule, doneIds, student, false, block2Duration, true, true, i);
                //Thursday
                tryToFitStudent(currentScore, 4+i, 4, extendedBlockStart, extendedBlockEnd, schedule, doneIds, student, false, block2Duration, true, true, i);
                //Friday
                tryToFitStudent(currentScore, 4+i, 5, extendedBlockStart, fridayEnd, schedule, doneIds, student, false, block2Duration, true, true, i);
            });
        }


        orderedList.forEach(student => {
            if (!doneIds.includes(student.studentid)) {
                missingStudents.block2.push(student.studentid);
            }
        });

        //Add score for holes
        for (let day = 1; day <= 5; day++) {
            var skip = false;
            for (let block = extendedBlockStart; block <= extendedBlockEnd; block++) {
                var filteredSchedule = schedule.filter(e => {
                    return e.Day == day && e.Block == block;
                });
                if (skip) {
                    if (filteredSchedule.length == 0)
                        continue;
                    else {
                        skip = false;
                    }
                }
                if (filteredSchedule.length >= 1)
                    continue;
                else {
                    var scheduleBefore = schedule.filter(e => {
                        return e.Day == day && e.Block >= extendedBlockStart && e.Block <= block;
                    });
                    var scheduleAfter = schedule.filter(e => {
                        return e.Day == day && e.Block >= block && e.Block <= extendedBlockEnd;
                    });
                    if (scheduleBefore.length > 0 && scheduleAfter.length > 0) {
                        //That's a hole, add score
                        currentScore.score = currentScore.score + scoreForHoles;
                        skip = true;
                    }
                }
            }
        }

        schedules.push(schedule);
        schedulesAndScore.push({ schedule: schedule, score: currentScore.score, missingStudents: missingStudents });
    });

    //Sort by small scores
    schedulesAndScore.sort((a, b) => {
        return a.score - b.score;
    });

    return schedulesAndScore;

}



module.exports = { executeQuery, getCurrentSemester, generateSchedule, blockToTime, timeToBlock }