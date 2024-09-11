const { EmbedBuilder } = require('discord.js')
const { hasAdminRole } = require('../utils/utils.js')

const execute = async (bot, msg, args, interactions) => {
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🎉 **AJUDA** 🎉')
        .setDescription('Aqui estão os comandos disponíveis para você:')
        .setThumbnail(bot.user.displayAvatarURL({ format: 'png', dynamic: true }))
        .setTimestamp()
        .setFooter({ text: `Configuração do Bot - ${bot.user.username}`, iconURL: bot.user.displayAvatarURL({ format: 'png', dynamic: true }) })


    bot.commands.forEach(command => {
        if (command.help) {
            if (hasAdminRole(msg) || !command.adm) {
                embed.addFields(
                    { name: `${process.env.PREFIX}${command.name}`, value: command.help, inline: false }
                )
            }
        }
    })

    // Envia o embed de ajuda
    return msg.reply({ embeds: [embed], ephemeral: hasAdminRole(msg) })
}

module.exports = {
    name: 'help',
    adm: false,
    execute,
}
