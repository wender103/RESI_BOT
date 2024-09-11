const { EmbedBuilder } = require('discord.js')
const { getServidores, Esse_Servidor } = require('../utils/utils.js')
const execute = async (bot, msg, args) => {
    // Obter o valor atual de Servidores
    let servidor_atual = Esse_Servidor(msg.guildId)
    try {
        // Tenta buscar o canal pelo ID
        let channelId = servidor_atual.ID_Canal_Comandos
        const channel = await msg.guild.channels.fetch(channelId)

        // Cria um embed com as informações do canal
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Canal configurado')
            .setDescription('O bot responde a comandos neste canal:')
            .addFields([
                { name: 'ID:', value: `${channel.id}`, inline: false }, // Garantindo que o valor é uma string
                { name: 'Nome:', value: `<#${channel.id}>`, inline: false }, // Garantindo que o valor é uma string
                { name: 'Prefixo:', value: `${servidor_atual.Prefix}`, inline: true },
            ])
            .setTimestamp()
            .setFooter({ text: `Atualizado por ${bot.user.username}`, iconURL: bot.user.displayAvatarURL({ format: 'png', dynamic: true }) })

        // Responde com o embed
        msg.reply({ embeds: [embed] })

    } catch (error) {
        console.error('Erro ao buscar o canal:', error)

        // Cria um embed de erro
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('🚫 **Canal não encontrado!** 🚫')
            .setDescription('Parece que o bot ainda não foi configurado neste servidor. 😔🔧 Para configurar o bot e adicionar o token, user o comando: **.start** 💬😃')
            .setTimestamp()
            .setFooter({ text: `Atualizado por ${bot.user.username}`, iconURL: bot.user.displayAvatarURL({ format: 'png', dynamic: true }) })

        // Responde com o embed de erro
        msg.reply({ embeds: [errorEmbed] })
    }
}

module.exports = {
    name: 'ver_canal',
    help: 'Motra o canal em que o bot manda mensgem',
    adm: false,
    execute,
}