const { getCourses } = require('../util')
const { MessageType } = require('@adiwajshing/baileys')

module.exports = {
    name: 'courses',
    args: false,
    syntax: 'courses',
    permission: 'OWNER',
    description: 'Alle Kurse, gefiltert nach KategorieID 265',

    async execute(Client, msg, args, from) {
        let courseArr = await getCourses()
        return Client.sendMessage(from, courseArr ? courseArr : 'Nothing', MessageType.text)
    },
}