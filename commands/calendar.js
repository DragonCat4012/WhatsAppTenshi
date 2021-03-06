const { getCalender } = require('../getCalender')
const { MessageType } = require('@adiwajshing/baileys')

module.exports = {
    name: 'calendar',
    args: true,
    syntax: 'calendar',
    description: 'Zu erledigende Abgaben',

    async execute(Client, msg, args, from) {
        let start = (new Date()).getTime()
        let lastCalender = await getCalender();
        lastCalender = lastCalender
            .sort((a, b) => a.nosubmissions - b.nosubmissions)
            .sort((a, b) => a.duedate - b.duedate);

        let text = `*Assigments* ${lastCalender.length}\n`;
        for (let assign of lastCalender) {
            let date = '♾';
            if (assign.dateTo !== 0) date = (new Date(assign.dateTo)).toLocaleString('de');
            text += `${assign.nosubmissions == 1 ? 'X' : ' '} ${assign.course}: ${assign.titel} ${date}\n`
        }

        let ende = (new Date()).getTime()
        return Client.sendMessage(from, text + `\n${ende - start}ms`, MessageType.text)
    },
}