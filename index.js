const { MessageType } = require('@adiwajshing/baileys')
const { WAConnection } = require("@adiwajshing/baileys")
const chalk = require('chalk')
const fs = require('fs')
const { join } = require('path')
const fileName = join(__dirname, `auth_info.json`)
const config = require('./config.json')

const Client = new WAConnection()
Client.loadAuthInfo(fileName)
Client.connect({ timeoutMs: 30 * 1000 })

const cooldowns = new Map()
Client.commandCache = new Map();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    Client.commandCache.set(command.name, command);
}

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
    // Client.sendMessage(config.groupId, 'Wuhu das ist die gruppen id i guess lol', MessageType.text)

    async () => {
        setInterval(async function () { await checkAssignment() }, 1000 * 60 * 30);
        let now = new Date()
        console.log(now.getHours(), ':', (now.getMinutes() + '').padStart(2, "0"))
    }
})

Client.on('close', () => { console.log("Connection closed") })

Client.on('chat-update', async (ctx) => {
    if (!ctx.hasNewMessage) return
    if (!ctx.messages) return
    if (ctx.key && ctx.key.remoteJid == 'status@broadcast') return
    ctx = ctx.messages.all()[0]
    if (!ctx.message) return

    const from = ctx.key.remoteJid
    // console.log('Message from: ', from)
    //   console.log(ctx)
    const type = Object.keys(ctx.message)[0]
    const msg = ctx.message.conversation || ctx.message[type].caption || ctx.message[type].text || ""
    msg.from = from
    if (!msg.startsWith("+")) return

    const args = msg.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    let command = Client.commandCache.get(commandName)
    let admin = false

    const sender = ctx.key.fromMe ? Client.user.jid : isGroup ? ctx.participant : ctx.key.remoteJid
    const senderNumber = sender.split("@")[0]
    if (config.admins.includes(senderNumber)) admin = true // || config.admins.includes(ctx.participant)

    if (!command) return
    if (command.cooldown) {
        let oldTime = cooldowns.get(from) + (command.cooldown * 1000) || (new Date()).getTime()
        let newtime = (new Date()).getTime()
        cooldowns.set(from, newtime)
        if ((newtime - oldTime) < 0) return Client.sendMessage(from, `Coolwdown \n ${(newtime - oldTime) / 1000 * (-1)} s`, MessageType.text)
    }
    if (!args && command.args) return Client.sendMessage(from, 'dieser Command benötigt min. ein Argument', MessageType.text)

    if (command.permission == 'OWNER' && !admin) return Client.sendMessage(from, 'Dir fehlen leider Berechtigungen um dies zu tun', MessageType.text)
    console.warn(`${from} used: ${commandName}`)

    if (admin && commandName == 'reload') return reloadModules(from)

    try {
        await command.execute(Client, msg, args, from)
    } catch (e) {
        console.log(e)
        return Client.sendMessage(from, 'Fehler aufgetreten qwq\n' + e, MessageType.text)
    }
})

async function checkAssignment() {
    let A = await checkCourse()
    console.log('Checked Assigment')
    if (!A.includes('>')) A = undefined
    if (!A) return
    Client.sendMessage(config.groupId, A, MessageType.text)
}

// Reload Comamnd Files
const reloadModules = async function (from) {
    var root = join(__dirname, "commands");
    console.log("Reload Modules");
    const commandDirectorys = fs.readdirSync(root).filter(file => file.endsWith('.js'));
    let module_count = 0

    for (let file of commandDirectorys) {
        let path = join(root, file);
        try {
            delete require.cache[require.resolve(path)];
            const newCommand = require(path);
            Client.commandCache.set(newCommand.name, newCommand);
            module_count++;
        } catch (error) {
            console.error(error);
            Client.sendMessage(from, `Beim neuladen von ${file} ist ein Fehler aufgetreten:\n${error.message}`, MessageType.text)
        }
    }
    Client.sendMessage(from, "Es wurden " + module_count + " Module neu geladen uwu", MessageType.text)
}