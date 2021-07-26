const { getCourseContent, getCoursesRaw } = require('./util')
const fs = require('fs')
const { join } = require('path')
const { moodleCourses } = require('./config.json')

async function checkCourse() {
    var newCourses = []
    var oldCourses = []
    let changesArray = []
    let text = 'Neue Änderung \n'

    for (courseID of moodleCourses) {
        var fetchedCourseModules = await getCourseContent(courseID)
        newCourses.push({ id: courseID, data: fetchedCourseModules })

        // If Course not saved yet
        let path = join(__dirname, 'coursedata', `${courseID}.json`)
        if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({ id: courseID, data: fetchedCourseModules }, null, 4))

        //load oldCourse
        let oldCourseData = fs.readFileSync(path);
        oldCourseData = JSON.parse(oldCourseData)
        oldCourses.push({ id: courseID, data: oldCourseData.data })

        //continue if no changes happened
        if (JSON.stringify(oldCourseData.data) == JSON.stringify(fetchedCourseModules)) continue

        var courseData = await getCoursesRaw(courseID)
        var courseInfo = courseData.find(c => c.id == courseID)
        // console.log('> Course Change found: ', courseInfo.shortname)

        //Saving new Changes
        changesArray.push({ id: courseID, data: fetchedCourseModules })
        fs.writeFileSync(path, JSON.stringify({ id: courseID, data: fetchedCourseModules }, null, 4))
    }

    for (let changedCourse of changesArray) {
        var courseData = await getCoursesRaw(changedCourse.id)
        var courseInfo = courseData.find(c => c.id == changedCourse.id)
        text += `\n> ${courseInfo.shortname}\n`

        let courseOLD = oldCourses.find(x => x.id == changedCourse.id)
        if (!courseOLD) return

        //check if module added
        for (let mod of changedCourse.data) {
            let moduleAdd = courseOLD.data.find(e => e.id == mod.id)
            if (!moduleAdd) text += `• Neues Modul: ${mod.name}\n`
            if (!moduleAdd) continue

            //check Name Change
            if (mod.name !== moduleAdd.name) text += `• Modulname geändert von ${mod.name} zu ${moduleAdd.name}\n`
        }

        //check if module deleted
        for (let mod of courseOLD.data) {
            let moduleRemoved = changedCourse.data.find(e => e.id == mod.id)
            if (!moduleRemoved) text += `• Gelöschtes Modul: ${mod.name}\n`
        }

        //check if module changed
        for (let mod of courseOLD.data) {
            let newModule = changedCourse.data.find(e => e.id == mod.id)
            if (!newModule) continue
            if (mod == newModule) continue

            const newcontent = newModule.modules
            const oldContent = mod.modules

            if (newcontent.length !== oldContent.length) {
                //check if module.content added
                for (let content of newcontent) {
                    let contentAdd = oldContent.find(e => e.id == content.id)
                    if (!contentAdd) text += `\t\t\t\t- Neuer Inhalt: ${content.name}\n`
                    if (!contentAdd) continue

                    //check Name Change
                    if (content.name !== contentAdd.name) text += `\t\t\t\t- Modulname geändert von ${content.name} zu ${contentAdd.name}\n`

                    //check Content Size
                    if (!content.contents) continue
                    if (content.contents.length !== contentAdd.contents.length) text += `\t\t\t\t- Modulanhänge bei ${content.name} geändert ${content.contents.length} => ${contentAdd.contents.length}\n`
                }

                //check if module.content deleted
                for (let content of oldContent) {
                    let contentRemoved = newcontent.find(e => e.id == content.id)
                    if (!contentRemoved) text += `\t\t\t\t- Gelöschter Inhalt: ${content.name}\n`
                }
            }
        }
    }
    //    if (text == 'Neue Änderung \n') text = undefined
    return text
}

module.exports = { checkCourse }