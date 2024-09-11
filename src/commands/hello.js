const { Mencionar_User } = require('../utils/utils.js')

const execute = (bot, msg, args) => {
    return msg.reply(`${Mencionar_User(msg)} Hello`)
}

module.exports = {
    name: 'hello',
    help: 'Diz: Hello, Wolrd!',
    adm: false,
    execute,
}