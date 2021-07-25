var Client = require('moodle-client');
const { moodlePassword, moodleUsername, moodleRoot } = require('./config.json')

async function getCourses() {
    var client = await Client.init({
        wwwroot: moodleRoot,
        username: moodleUsername,
        password: moodlePassword
    });

    return await callCourses(client, 265)

    function callCourses(client, categoryID) {
        return client.call({
            wsfunction: "core_course_get_courses_by_field",
            method: "GET",
        }).then(function (response) {
            let arr = []
            let newArr = response.courses.filter(e => { if (e.categoryid == categoryID) arr.push(e) })

            let text = '*Alle Kurse*\n-----------------------------------------------------\n'
            arr.forEach(e => {
                text += `\`• ${(e.fullname.replace('Grundkurs', 'GK').replace('Leistungskurs', 'LK').replace('Organisation', 'OG')).padEnd(25)}\` ${e.id}\n`
            })
            return text.replace(/11/g, "")
        });
    }
}

async function getCoursesRaw() {
    var client = await Client.init({
        wwwroot: moodleRoot,
        username: moodleUsername,
        password: moodlePassword
    });

    return await callCourses(client, 265)

    function callCourses(client, categoryID) {
        return client.call({
            wsfunction: "core_course_get_courses_by_field",
            method: "GET",
        }).then(function (response) {
            let arr = []
            let newArr = response.courses.filter(e => { if (e.categoryid == categoryID) arr.push(e) })
            return arr
        });
    }
}

async function getCourseContent(courseid) {
    var client = await Client.init({
        wwwroot: moodleRoot,
        username: moodleUsername,
        password: moodlePassword
    });

    return await callCourse(client, courseid)

    function callCourse(client, courseid) {
        return client.call({
            wsfunction: "core_course_get_contents",
            method: "POST",
            args: {
                courseid: courseid
            }
        }).then(function (response) {
            return response
        });
    }
}

module.exports = { getCourses, getCourseContent, getCoursesRaw }