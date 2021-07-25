var Client = require('moodle-client');
const { moodlePassword, moodleUsername, moodleRoot } = require('./config.json')
const fs = require('fs')

async function getCalender(time = (new Date()).getTime()) {
    var client = await Client.init({
        wwwroot: moodleRoot,
        username: moodleUsername,
        password: moodlePassword
    }).catch(function (err) {
        return ("Unable to initialize the client: " + err);
    });
    return await callCalender(client, time)
}

async function callCalender(client, time) {
    return client.call({
        wsfunction: "mod_assign_get_assignments",
    }).then(async function (courses) {
        courses = courses.courses
        let courseArr = courses.filter(c => c.assignments.length > 0);
        let AssignArray = []

        for (let course of courseArr) {
            for (let assign of course.assignments) {
                if ((assign.duedate * 1000) < time && assign.duedate !== 0) continue;

                let obj = {
                    course: (course.shortname).slice(3).replace(/ 11/g, '').padEnd(3),
                    titel: assign.name,
                    courseid: assign.course,
                    cmid: assign.cmid,
                    intro: assign.intro,
                    nosubmissions: assign.nosubmissions,
                    id: assign.id,
                    dateTo: assign.duedate * 1000,
                    dateCutOff: assign.cutoffdate * 1000,
                    subAllowed: assign.allowsubmissionsfromdate * 1000
                }
                AssignArray.push(obj)
            }
        }
        return AssignArray
    })
}
module.exports = { getCalender }