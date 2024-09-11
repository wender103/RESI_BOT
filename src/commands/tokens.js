const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const { getServidores, Esse_Servidor } = require('../utils/utils.js')
const { numerosEmojis } = require('../emojis/emojis.js')

const execute = (bot, msg, args) => {
    let servidor_atual = Esse_Servidor(msg.guildId)

    try {
        let array_btns = []
        let Description = ''
        for (let c = 0; c < servidor_atual.Tokens.length; c++) {
            Description += `${numerosEmojis[c]} **Nome:** ${servidor_atual.Tokens[c].Jetton.name} **Canal:** <#${servidor_atual.Tokens[c].Canal}>\n`
            
            const button = new ButtonBuilder()
                .setCustomId(`btns_jetton:${servidor_atual.ID} ${servidor_atual.Tokens[c].ID}`)
                .setLabel(`${c + 1}`)
                .setStyle(ButtonStyle.Primary)

            array_btns.push(button)
        }


        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🪙 **Tokens do Servidor** 🪙')
            .setDescription('🔢 Escolha um número para ter mais informações sobre o token.')
            .setDescription(Description)
            .setTimestamp()
            .setFooter({ text: `Atualizado por ${bot.user.username} 🚀`, iconURL: bot.user.displayAvatarURL({ format: 'png', dynamic: true }) })

        const rows = []
        while (array_btns.length > 0) {
            const rowButtons = array_btns.splice(0, 5) // Pega até 5 botões
            const row = new ActionRowBuilder().addComponents(rowButtons)
            rows.push(row)
        }
        

        // Responde com o embed
        msg.reply({ embeds: [embed], components: rows })

    } catch (error) {
        console.error('Erro ao buscar o canal:', error)

        // Cria um embed de erro
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('🚫 **Algo Deu Errado 🚫')
            .setDescription('Não consegui encontrar seus tokens. 😔🔧')
            .setTimestamp()
            .setFooter({ text: `Atualizado por ${bot.user.username}`, iconURL: bot.user.displayAvatarURL({ format: 'png', dynamic: true }) })

        // Responde com o embed de erro
        msg.reply({ embeds: [errorEmbed] })
    }
}

module.exports = {
    name: 'tokens',
    help: 'Mostra todos os tokens:',
    adm: false,
    execute,
}