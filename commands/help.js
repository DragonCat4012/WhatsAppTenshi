const alt = '----------------------------------------------'
const { MessageType } = require('@adiwajshing/baileys')

module.exports = {
    name: 'help',
    args: false,
    syntax: 'help',
    description: 'Übersicht aller Befehle',
    async execute(Client, msg, args) {
        let arr = []

        Client.commandCache.forEach((value, key) => {
            let cmd = Client.commandCache.get(key)
            arr.push('``` ' + `${key.padEnd(14)} - ${cmd.permission == 'OWNER' ? "[A]" : ''} ${value.description ?? 'None'}` + '```')
        })
        return Client.sendMessage(msg.from, 'Hi! Hier gibt es nichts zu sehen, gehen Sie weiter\n\n' + arr.join('\n'), MessageType.text)
    },

}