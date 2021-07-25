const { MessageType } = require('@adiwajshing/baileys')

module.exports = {
    name: 'test',
    args: false,
    syntax: 'test',
    description: 'Teste nichts',
    cooldown: 10,
    async execute(Client, msg, args, from) {
        return Client.sendMessage(from, 'Heeeeeeeeeeeeeeeelp', MessageType.text)
    },
}