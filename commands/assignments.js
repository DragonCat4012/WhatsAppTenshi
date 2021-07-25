const { checkCourse } = require('../checkCourseChanges')
const { MessageType } = require('@adiwajshing/baileys')

module.exports = {
    name: 'assignments',
    args: false,
    syntax: 'assignments',
    permission: 'OWNER',
    description: 'Zeigt die neusten Änderungen der Kurse',
    async execute(Client, msg, args, from) {
        let newChanges = await checkCourse()
        if (!newChanges.includes('>')) newChanges = undefined

        return Client.sendMessage(from, newChanges ?? 'Nichts neues', MessageType.text)
    },
}