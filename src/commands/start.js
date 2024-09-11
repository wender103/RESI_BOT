const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js')
const { Esse_Servidor, hasAdminRole } = require('../utils/utils.js')

const execute = async (bot, msg, args) => {
    let servidor_atual = Esse_Servidor(msg.guildId)

    if (hasAdminRole(msg)) {
        // Criação dos botões com estilos de acordo com a configuração atual
        const Button_Canal_Comandos = new ButtonBuilder()
            .setCustomId('Adicionar_Canal_Comandos')
            .setLabel('Escolher Canal De Comandos')
            .setStyle(servidor_atual.ID_Canal_Comandos ? ButtonStyle.Success : ButtonStyle.Danger)

        const Button_Token = new ButtonBuilder()
            .setCustomId('Adicionar_Token')
            .setLabel('Adicionar Token')
            .setStyle(servidor_atual.Tokens.length > 0 ? ButtonStyle.Success : ButtonStyle.Danger)

        const Button_Ver_Tokens = new ButtonBuilder()
            .setCustomId('Ver_Tokens')
            .setLabel('Ver Tokens')
            .setStyle(servidor_atual.Tokens.length > 0 ? ButtonStyle.Primary : ButtonStyle.Secondary)
            .setDisabled(servidor_atual.Tokens.length === 0) // Desabilita o botão se não houver tokens

        const Button_Ver_Canal = new ButtonBuilder()
            .setCustomId('Ver_Canal_Comandos')
            .setLabel('Ver Canal')
            .setStyle(servidor_atual.ID_Canal_Comandos ? ButtonStyle.Primary : ButtonStyle.Secondary)
            .setDisabled(!servidor_atual.ID_Canal_Comandos) // Desabilita o botão se não houver um canal configurado


        const Button_Alterar_Prefix = new ButtonBuilder()
            .setCustomId(`Alterar_Prefix:${servidor_atual.ID}`)
            .setLabel('Alterar Prefixo')
            .setStyle(servidor_atual.ID_Canal_Comandos ? ButtonStyle.Primary : ButtonStyle.Secondary)

        const row = new ActionRowBuilder().addComponents(Button_Canal_Comandos, Button_Token, Button_Ver_Tokens, Button_Ver_Canal, Button_Alterar_Prefix)

        // Criação do embed
        const embed = new EmbedBuilder()
            .setColor('#0099ff') // Cor azul para o embed
            .setTitle('🚀 Inicie a Configuração do Bot')
            .setDescription('Este bot ajuda a gerenciar transações e informações sobre tokens no seu servidor. Use os botões abaixo para configurar o bot:')
            .addFields(
                { name: '🔧 Adicionar Canal de Comandos', value: 'Defina o canal onde o bot responderá aos comandos.', inline: false },
                { name: '💬 Adicionar Token', value: 'Informe quais tokens o bot deve analisar e onde ele deve informar as transações.', inline: false },
                { name: '📊 Ver Tokens', value: 'Veja a lista de tokens do servidor para obter mais informações.', inline: false },
                { name: '💻 Ver Canal', value: 'Ver o canal no qual o bot responde a comandos.', inline: false }
            )
            .setThumbnail(bot.user.displayAvatarURL({ format: 'png', dynamic: true }))
            .setTimestamp()
            .setFooter({ text: `Configuração do Bot - ${bot.user.username}`, iconURL: bot.user.displayAvatarURL({ format: 'png', dynamic: true }) })

        // Enviar resposta com embed e botões
        await msg.reply({
            embeds: [embed],
            components: [row],
        })
    } else {
        msg.reply('🚫 Você não tem permissão para usar este comando!')
    }
}

module.exports = {
    name: 'start',
    help: 'Configurar o bot',
    adm: true,
    execute,
}