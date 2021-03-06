const { MessageType } = require('@adiwajshing/baileys')
const { WAConnection } = require("@adiwajshing/baileys")
const chalk = require('chalk')
const fs = require('fs')
const { join } = require('path')
const fileName = join(__dirname, `auth_info.json`)
const config = require('./config.json')
const { checkCourse } = require('./checkCourseChanges')

const Client = new WAConnection()
Client.logger.level = 'warn'
Client.loadAuthInfo(fileName)
Client.connect({ timeoutMs: 30 * 1000 })

const cooldowns = new Map();
Client.commandCache = new Map();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    Client.commandCache.set(command.name, command);
}

Client.on('open', async () => {
    let now = new Date()
    console.log(chalk.keyword("pink")("[ STATS ]"), chalk.whiteBright("WA Version : ".padStart(18, " ") + Client.user.phone.wa_version))
    console.log(chalk.keyword("pink")("[ STATS ]"), chalk.whiteBright("OS Version : ".padStart(18, " ") + Client.user.phone.os_version))
    console.log(chalk.keyword("pink")("[ STATS ]"), chalk.whiteBright("Device : ".padStart(18, " ") + Client.user.phone.device_manufacturer))
    console.log(chalk.keyword("pink")("[ STATS ]"), chalk.whiteBright("Model : ".padStart(18, " ") + Client.user.phone.device_model))
    console.log(chalk.keyword("pink")("[ STATS ]"), chalk.whiteBright("OS Build Number : " + Client.user.phone.os_build_number))
    console.log(chalk.keyword("aqua")("[ STATS ]"), chalk.whiteBright("Time : ".padStart(18, " ") + now.getHours(), ':', (now.getMinutes() + '').padStart(2, "0")))

    const authInfo = Client.base64EncodedAuthInfo()
    fs.writeFileSync(fileName, JSON.stringify(authInfo, null, '\t'))

    setInterval(async function () { await checkAssignment() }, 1000 * 60 * 30);
})

Client.on('chat-update', async (ctx) => {
    if (!ctx.hasNewMessage) return
    if (!ctx.messages) return
    if (ctx.key && ctx.key.remoteJid == 'status@broadcast') return
    ctx = ctx.messages.all()[0]
    if (!ctx.message) return

    const from = ctx.key.remoteJid
    const type = Object.keys(ctx.message)[0]
    const msg = ctx.message.conversation || ctx.message[type].caption || ctx.message[type].text || ""
    msg.from = from
    if (!msg.startsWith("+")) return

    const args = msg.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    let command = Client.commandCache.get(commandName)

    const sender = ctx.key.fromMe ? Client.user.jid : isGroup ? ctx.participant : ctx.key.remoteJid
    const senderNumber = sender.split("@")[0]

    let admin = false
    if (config.admins.includes(senderNumber)) admin = true
    if (!command) return

    if (command.cooldown) {
        let oldTime = cooldowns.get(from) + (command.cooldown * 1000) || (new Date()).getTime()
        let newtime = (new Date()).getTime()
        cooldowns.set(from, newtime)
        if ((newtime - oldTime) < 0) return Client.sendMessage(from, `Coolwdown \n ${(newtime - oldTime) / 1000 * (-1)} s`, MessageType.text)
    }

    if (!args && command.args) return Client.sendMessage(from, 'dieser Command ben??tigt min. ein Argument', MessageType.text)
    if (command.permission == 'OWNER' && !admin) return Client.sendMessage(from, 'Dir fehlen leider Berechtigungen um dies zu tun', MessageType.text)
    if (admin && commandName == 'reload') return reloadModules(from)

    console.warn(`${senderNumber} (${from}) : ${commandName}`)

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
    if (!A.includes('>') || !A) return
    Client.sendMessage(config.groupId, A, MessageType.extendedText)
}

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