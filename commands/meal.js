const { getMealToday } = require('../getMeals')
const { openmensaCanteenId } = require('../config.json')
const { MessageType } = require('@adiwajshing/baileys')

module.exports = {
    name: 'meal',
    args: false,
    syntax: 'meal',
    description: 'Essseeeeeeeeen',
    async execute(Client, msg, args) {
        let date = new Date()
        let day = date.getDate()
        if (date.getDay() == 0) day = date.getDate() + 1
        if (date.getDay() == 6) day = date.getDate() + 2
        let month = date.getMonth() + 1

        let serachedDate = `${date.getFullYear()}-${month.length = 1 ? '0' + month : month}-${day}`
        let mealArray = await getMealToday(serachedDate, openmensaCanteenId)

        let mealList = []
        for (m of mealArray) {
            if (m.notes.includes('vegetarisch')) m.name = '💚 ' + m.name
            m.name = (m.name).replace(/\(.*?\)/g, '')
            let arr = m.name.split(';')
            mealList.push(`${arr[0]} \n`)
        }

        return Client.sendMessage(msg.from, `Essen ${serachedDate} \n\`• ` + mealList.join('\n• ') + '\`', MessageType.text)
    },
}