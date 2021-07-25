
const { MessageType } = require('@adiwajshing/baileys')
const { WAConnection } = require("@adiwajshing/baileys")
const chalk = require('chalk')
const fs = require('fs')
const { join } = require('path')
const fileName = join(__dirname, `auth_info.json`)

const Client = new WAConnection()
Client.loadAuthInfo(fileName)
await Client.connect()


Client.on("qr", () => {
    console.log(`Qr ready, scan`)
})

Client.on('open', () => {
    console.log(chalk.keyword("aqua")("[ STATS ]"), chalk.whiteBright("WA Version : " + Client.user.phone.wa_version))
    console.log(chalk.keyword("aqua")("[ STATS ]"), chalk.whiteBright("OS Version : " + Client.user.phone.os_version))
    console.log(chalk.keyword("aqua")("[ STATS ]"), chalk.whiteBright("Device : " + Client.user.phone.device_manufacturer))
    console.log(chalk.keyword("aqua")("[ STATS ]"), chalk.whiteBright("Model : " + Client.user.phone.device_model))
    console.log(chalk.keyword("aqua")("[ STATS ]"), chalk.whiteBright("OS Build Number : " + Client.user.phone.os_build_number))
    console.log(chalk.keyword("aqua")("[ STATS ]"), chalk.whiteBright('Welcome My Senpai'))

    const authInfo = Client.base64EncodedAuthInfo()
    fs.writeFileSync(fileName, JSON.stringify(authInfo, null, '\t'))
})

Client.on('close', () => { console.log("Connection closed") })

Client.connect({ timeoutMs: 30 * 1000 }).then(async c => {
    //Tenshi Test id 4915204376731-1627232355@g
    const id = "4915204376731-1627232355@g"
    const sentMsg = await conn.sendMessage(id, 'oh hello there', MessageType.text)
})

Client.on('chat-update', async (ctx) => {
    if (!ctx.hasNewMessage) return
    if (!ctx.messages) return
    if (ctx.key && ctx.key.remoteJid == 'status@broadcast') return
    ctx = ctx.messages.all()[0]
    if (!ctx.message) return

    const from = ctx.key.remoteJid
    console.log('Message from: ', from)
    const body = ctx.message.conversation || ctx.message[type].caption || ctx.message[type].text || ""

    console.log(body)

    if (!body.startsWith("+")) {
        console.log('no cmd')
    } else {
        console.log(' cmd')
    }


})