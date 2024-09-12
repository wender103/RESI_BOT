/**
* Meus Metodos
* 
* * Comentários gerais e explicativos. Use para descrever o que o código faz ou fornecer informações adicionais.
* ! Comentários importantes que precisam de atenção imediata, como problemas ou bugs críticos. 
* ? Comentários com perguntas ou dúvidas sobre o código que precisam de esclarecimento ou revisão.
* TODO Comentários que indicam tarefas ou melhorias futuras que precisam ser feitas no código.
*/

const { Client, Collection, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, Events, EmbedBuilder } = require("discord.js")
const dotenv = require("dotenv")
const fs = require('fs')
const path = require('path')
const { Mencionar_User, getJettonInfo, hasAdminRole, getAccountTransactions, JaConfigurado, getServidores, setServidores, Esse_Servidor, Adicionar_Token, Adicionar_Canal_Comandos, formatar_number, RemoveListener_Token, Alterar_Canal_Transacoes, JaTemEsseToken, sortTransactionsByUtime, getTransactionsAfterHash, checarSimbolo, Alterar_Prefix_Do_Servidor, Delay } = require('./utils/utils.js')
const { getCollectionData, addDocumentToCollection, removeDocumentFromCollection } = require('./firebase/firebase.js')
const { channel } = require("diagnostics_channel")
const { setTimeout } = require("timers/promises")

//* Obter o valor atual de Servidores
let Servidores = getServidores()
dotenv.config()

getCollectionData('Servidores').then((resp) => {
    Servidores = resp
    setServidores(Servidores)

    //! Modo novo transações
    // Check_Transactions()

    //! Modo antigo transações
    // startMonitoring()
})

const bot = new Client({ 
    intents: 37635,
})

//* Bot vai processar os comandos
bot.commands = new Collection()

const commandFiles = fs
    .readdirSync(path.join(__dirname, "/commands"))
    .filter((filename) => filename.endsWith('.js'))

for(var filename of commandFiles) {
    const command = require(`./commands/${filename}`)
    bot.commands.set(command.name, command)
}

let Nomes_Servidores = []
//* Será execultado assim que o bot estiver pronto
bot.on("ready", (e) => {
    Nomes_Servidores = []
    // console.log(`Bot ${e.user.tag} foi iniciado, com ${bot.users.cache.size} usuários, em ${bot.channels.cache.size} canais, em ${bot.guilds.cache.size} servidores.`)
    bot.user.setActivity(`Eu estou em ${bot.guilds.cache.size} servidores`) //* Altera o jogando do bot

    bot.user.setStatus('online') //* Altera o status do bot Idle, Online, Invisible...]

    let Servidores = getServidores()

    for (let c = 0; c < Servidores.length; c++) {
        const guild = bot.guilds.cache.get(Servidores[c].ID);

        if (guild) {
            Nomes_Servidores.push({ID: Servidores[c].ID, Nome: guild.name})
        }
    }

    Check_Transactions()
})

//* Será execultado sempre que o bot for adicionado em algum servidor
bot.on("guildCreate", guild => {
    // console.log(`O bot entrou no servidor: ${guild.name} (id: ${guild.id}). População: ${guild.memberCount} membros!`)

    //* Vai informar nos status do bot em quantos servers ele está
    bot.user.setActivity(`Estou em ${bot.guilds.cache.size} servidores`)

    const new_servidor = {
        ID: guild.id,
        Tokens: [],
        Prefix: '.',
        ID_Canal_Comandos: null,
    }

    addDocumentToCollection('Servidores', new_servidor.ID, new_servidor)
    Servidores = getServidores()
    Servidores.push(new_servidor)

    // console.log('----------------------- Entrou ---------------------')
    // console.log(Servidores)
    // console.log('----------------------------------------------------')
})

//* Será execultado sempre que o bot for removido de algum servidor
bot.on("guildDelete", guild => {
    // console.log(`O bot foi removido do servidor: ${guild.name} (id: ${guild.id})`)

    //* Vai informar nos status do bot em quantos servers ele está
    bot.user.setActivity(`Serving ${bot.guilds.cache.size} servers`)

    for (let c = 0; c < Servidores.length; c++) {
        if(Servidores[c].ID == guild.id) {
            Servidores.splice(c, 1)
            // console.log('----------------------- Saiu ---------------------')
            // console.log(Servidores)
            // console.log('--------------------------------------------------')
            removeDocumentFromCollection('Servidores', guild.id)
            break
        }
    }
})

//* Monitora tudo que é enviado no chat
bot.on("messageCreate", message => {
    let canal_certo = true

    let servidor_atual = Esse_Servidor(message.guildId)

    let prefixo_do_servidor_atual = process.env.PREFIX

    if(servidor_atual.Prefix != prefixo_do_servidor_atual) {
        prefixo_do_servidor_atual = servidor_atual.Prefix
    }


    //* Extrair o comando e argumentos
    const args = message.content.slice(prefixo_do_servidor_atual.length).trim().split(/ +/)
    let command = args.shift().toLowerCase()

    //* Caso o bot for mencionado
    if (message.mentions.has(bot.user)) {
        if(servidor_atual.ID_Canal_Comandos == message.channel.id) {
            bot.commands.get('start').execute(bot, message)
        } else {
            bot.commands.get('ver_canal').execute(bot, message)
        }

    } else {
        if(!message.content.toLocaleLowerCase().includes('ver_canal')) {
            if(servidor_atual.ID_Canal_Comandos && servidor_atual.ID_Canal_Comandos != message.channelId) {
                canal_certo = false
            }
        }
        
        if (message.author.bot || !message.content.startsWith(prefixo_do_servidor_atual) || !canal_certo) return

        //* Remove caracteres extras como ':'
        command = command.replace(':', '')

        try {
            //* Pega as informações do servidor atual
            let servidor_atual = Esse_Servidor(message.guildId)

            //* Checa se o servidor atual já foi configurado
            if (JaConfigurado(servidor_atual.ID)) {
                if (bot.commands.has(command)) {
                    bot.commands.get(command).execute(bot, message, args)  

                } else {
                    message.reply('Comando não encontrado.')
                }

            } else {
                //* Caso não tenha sido configurado checa se é um adm que está tentando configurar
                if (hasAdminRole(message)) {
                    let msg_lower = message.content.toLocaleLowerCase()
                    if (!msg_lower.includes('.start')) {
                        if(msg_lower.includes('ver_canal') && servidor_atual.ID_Canal_Comandos) {
                            bot.commands.get(command).execute(bot, message, args)  
                            
                        } else {
                            message.reply('🚨 Use o comando **.start** para configurar o bot. 🛠️🔧')
                        }
                    } else {
                        bot.commands.get(command).execute(bot, message, args)  
                    }

                } else {
                    message.reply('🚨 Oops! 🚨 Parece que eu ainda não fui configurado pelos administradores deste servidor! 🛠️🔧')
                }
            }
        } catch (error) {
            // console.log(error)
            return message.reply('Ops! Eu ainda não conheço esse comando!')
        }
    } 

})

//* Interações
bot.on(Events.InteractionCreate, async (interaction) => {

    //* Modal .start
    if (interaction.isButton()) {
        let customId = interaction.customId;

        let modal;

        if (customId === 'Adicionar_Canal_Comandos') {
            if(hasAdminRole(interaction)) {
                modal = new ModalBuilder()
                    .setCustomId('modal_Canal_Comandos')
                    .setTitle('Adicionar Canal De Comandos');

                const canalInput = new TextInputBuilder()
                    .setCustomId('canalInput')
                    .setLabel("Qual o ID do canal de comandos?")
                    .setStyle(TextInputStyle.Short);

                const actionRow = new ActionRowBuilder().addComponents(canalInput);
                modal.addComponents(actionRow);
            } else {
                interaction.reply({ content:'🚫 Você não tem permissão para usar este comando!', ephemeral: true })
            }

        } else if (customId === 'Adicionar_Token') {
            if(hasAdminRole(interaction)) {
                modal = new ModalBuilder()
                    .setCustomId('modal_Adicionar_Token')
                    .setTitle('Adicionar Token');

                const tokenInput = new TextInputBuilder()
                    .setCustomId('tokenInput')
                    .setLabel("Qual o token?")
                    .setStyle(TextInputStyle.Short);

                const canalToken = new TextInputBuilder()
                    .setCustomId('canal_token')
                    .setLabel("Qual o ID do canal das transações")
                    .setStyle(TextInputStyle.Short);

                const actionRow1 = new ActionRowBuilder().addComponents(tokenInput);
                const actionRow2 = new ActionRowBuilder().addComponents(canalToken);
                
                modal.addComponents(actionRow1, actionRow2);
            } else {
                interaction.reply({ content:'🚫 Você não tem permissão para usar este comando!', ephemeral: true })
            }

        } else if(customId.includes('remover_token:')) {
            if(hasAdminRole(interaction)) {
                customId = customId.replace('remover_token:', '')
                const [serverID, token] = customId.split(' ')

                interaction.reply(RemoveListener_Token(serverID, token))
            } else {
                interaction.reply({ content:'🚫 Você não tem permissão para usar este comando!', ephemeral: true })
            }

        } else if(customId.includes('trocar_canal:')) {
            if(hasAdminRole(interaction)) {
                customId = customId.replace('trocar_canal:', '')
                const [serverID, token] = customId.split(' ')
                if(JaTemEsseToken(serverID, token)) {
                    modal = new ModalBuilder()
                        .setCustomId(`modal_trocar_canal_token:${serverID} ${token}`)
                        .setTitle('Alterar Canal De Transações')

                    const canalInput = new TextInputBuilder()
                        .setCustomId('id_novo_canal_transacoes')
                        .setLabel("ID Do Novo Canal De Transações")
                        .setStyle(TextInputStyle.Short)

                    const actionRow = new ActionRowBuilder().addComponents(canalInput)
                    modal.addComponents(actionRow)
                } else {
                    interaction.reply({ content: '🔄 Token Não Encontrado! 🚫', ephemeral: true })
                }

            } else {
                interaction.reply({ content:'🚫 Você não tem permissão para usar este comando!', ephemeral: true })
            }

        } else if(customId.includes('btns_jetton:')) {
            customId = customId.replace('btns_jetton:', '')
            const [serverID, buttonID] = customId.split(' ')            
            
            let servidor_atual = Esse_Servidor(serverID)
            

            if(servidor_atual.Tokens.length > 0) {
                for (let c = 0; c < servidor_atual.Tokens.length; c++) {
                    // console.log(servidor_atual.Tokens[c].ID, buttonID)
                    if(servidor_atual.Tokens[c].ID == buttonID) {
                        // console.log(servidor_atual.ID, buttonID)
                        
                        
                        Retornar_Jetton(servidor_atual.ID, buttonID).then(async resp => {
                            await interaction.reply({ embeds: resp.Embed, components: resp.Components })

                        }).catch(async (error) => {
                            await interaction.reply(error)

                        })
                        break
                    }            
                }
            }
        } else if(customId == 'Ver_Tokens') {
            bot.commands.get('tokens').execute(bot, interaction)
        } else if(customId == 'Ver_Canal_Comandos') {
            bot.commands.get('ver_canal').execute(bot, interaction)
        } else if(customId.includes('Alterar_Prefix')) {
            if(hasAdminRole(interaction)) {
                let servidor_atual = Esse_Servidor(customId.replace('Alterar_Prefix:', ''))
                modal = new ModalBuilder()
                    .setCustomId(`Modal_Altear_Prefix:${servidor_atual.ID}`)
                    .setTitle(`Altere o prefixo: "${servidor_atual.Prefix}" por outro simbolo`);

                const canalInput = new TextInputBuilder()
                    .setCustomId('canalInput')
                    .setLabel("Qual o novo prefixo? Use apenas um simbolo.")
                    .setStyle(TextInputStyle.Short);

                const actionRow = new ActionRowBuilder().addComponents(canalInput);
                modal.addComponents(actionRow);
            } else {
                interaction.reply({ content:'🚫 Você não tem permissão para usar este comando!', ephemeral: true })
            }
        }

        if (modal) {
            await interaction.showModal(modal);
        }
    } else if (interaction.isModalSubmit()) {
        let customId = interaction.customId;

        if (customId === 'modal_Canal_Comandos') {
            if(hasAdminRole(interaction)) {
                const canalInputValue = interaction.fields.getField('canalInput').value;

                try {
                    // Verifica se o canal é válido
                    const channel = await interaction.guild.channels.fetch(canalInputValue)

                    Adicionar_Canal_Comandos(canalInputValue, interaction.guildId).then(resp => {
                        if (resp.sucesso) {
                            interaction.reply(resp.msg)
                        } else {
                            interaction.reply(resp.msg)
                        }
                    })
                    
                } catch (error) {
                    await interaction.reply(`O ID do canal fornecido não é válido ou não foi encontrado.`)
                }

                // Faça algo com o valor
                // await interaction.reply(`ID do canal de comandos recebido: ${canalInputValue}`);
            } else {
                interaction.reply({ content:'🚫 Você não tem permissão para usar este comando!', ephemeral: true })
            }

        } else if (customId === 'modal_Adicionar_Token') {
            if(hasAdminRole(interaction)) {
                const tokenInputValue = interaction.fields.getField('tokenInput').value
                const canalTokenValue = interaction.fields.getField('canal_token').value

                if (!JaTemEsseToken(interaction.guildId, tokenInputValue)) {
                try {
                    const channel = await interaction.guild.channels.fetch(canalTokenValue)
                    
                    // Responde inicialmente para evitar expiração da interação
                    await interaction.reply({ content: '🔄 Processando... Por favor, aguarde.', ephemeral: true })

                    // Chama a função Adicionar_Token e depois atualiza a resposta
                    const resp = await Adicionar_Token(tokenInputValue, canalTokenValue, interaction.guildId)
                    
                    await interaction.editReply(resp.msg)  // Atualiza a resposta inicial
                } catch (error) {
                    await interaction.reply({ content: 'O ID do canal fornecido não é válido ou não foi encontrado.', ephemeral: true })
                }
                } else {
                    await interaction.reply({ content: '🔄 Token Já Adicionado! 🚫', ephemeral: true })
                }

            } else {
                interaction.reply({ content:'🚫 Você não tem permissão para usar este comando!', ephemeral: true })
            }

        } else if(customId.includes('modal_trocar_canal_token:')) {
            if(hasAdminRole(interaction)){
                customId = customId.replace('modal_trocar_canal_token:', '')
                const [serverID, token] = customId.split(' ')

                const Canal_ID = interaction.fields.getField('id_novo_canal_transacoes').value

                interaction.reply(Alterar_Canal_Transacoes(serverID, token, Canal_ID))
            } else {
                interaction.reply({ content:'🚫 Você não tem permissão para usar este comando!', ephemeral: true })
            }
        } else if(customId.includes('Modal_Altear_Prefix')) {
            if(hasAdminRole(interaction)){
                const canalInputValue = interaction.fields.getField('canalInput').value
                if(checarSimbolo(canalInputValue)) {
                    //* Caso sejá um simbolo, no entanto mais de um caracter ele vai barrar
                    if(canalInputValue.length == 1) {
                        interaction.reply(Alterar_Prefix_Do_Servidor(customId.replace('Modal_Altear_Prefix:', ''), canalInputValue))

                    } else {
                        interaction.reply({ content: '🔄 Digite apenas um símbolo', ephemeral: true })
                    }

                } else {
                    interaction.reply({ content: '🔄 O simbolo fornecido não é válido ou não foi encontrado.', ephemeral: true })
                }
            } else {
                interaction.reply({ content:'🚫 Você não tem permissão para usar este comando!', ephemeral: true })
            }
        }
    }
})


bot.login(process.env.TOKEN)

//! ------------------------------------------------------------- Funções A Parte -----------------------------------------------

//* Retorna as transações
async function Check_Transactions() {
    // console.log('Comando rodando');

    let Servidores = getServidores();    

    for (let c = 0; c < Servidores.length; c++) {
        if (Servidores[c].Tokens.length > 0) {
            
            // console.log(`Servidor: ${Nomes_Servidores[c].Nome}`);

            for (let b = 0; b < Servidores[c].Tokens.length; b++) {
                let Todas_Transacoes = [];

                async function Olhar_As_Transacoes(Holder) {
                    await Delay(1000); // Aguarda 1 segundo
                    try {
                        // console.log('Analizando Holder');

                        const data = await getAccountTransactions(Holder);

                        // ? Verifica se data.transactions existe e é um array
                        if (Array.isArray(data.transactions)) {
                            Todas_Transacoes.push(...data.transactions);
                        } else {
                            console.error(`A resposta da API para o holder ${Holder} não contém uma lista de transações.`, data);
                        }
                    } catch (error) {
                        console.error(`Erro ao processar o servidor ${Servidores[c].ID} com token ${Servidores[c].Tokens[b].ID}: ${error}`);
                    }
                }

                for (let a = 0; a < Servidores[c].Tokens[b].Holders.length; a++) {
                    let Holder = Servidores[c].Tokens[b].Holders[a];
                    await Olhar_As_Transacoes(Holder);
                }

                // ! Vai ordenar as transações pelo utime
                Todas_Transacoes = sortTransactionsByUtime(Todas_Transacoes);
                Todas_Transacoes = getTransactionsAfterHash(Todas_Transacoes, Servidores[c].Tokens[b].Last_Transaction);

                if (Todas_Transacoes.length > 0) {
                    Servidores[c].Tokens[b].Last_Transaction = Todas_Transacoes[0].hash;
                    setServidores(Servidores, Servidores[c].ID);

                    for (let t = Todas_Transacoes.length - 1; t >= 0; t--) {
                        try {
                            const guild = bot.guilds.cache.get(Servidores[c].ID);
                            if (!guild) {
                                // console.log('Servidor não encontrado.');
                                return;
                            }

                            const channel = guild.channels.cache.get(Servidores[c].Tokens[b].Canal);
                            if (!channel) {
                                // console.log('Canal de transações não encontrado');

                                const embed = new EmbedBuilder()
                                    .setColor('#ff0000')
                                    .setTitle('⚠️ Token Removido ⚠️')
                                    .setDescription(`O token foi removido porque o seu canal de transações foi deletado. 🗑️`)
                                    .setThumbnail(Servidores[c].Tokens[b].Jetton.image)
                                    .setTimestamp()
                                    .setFooter({ text: `Atualizado por ${bot.user.username}`, iconURL: bot.user.displayAvatarURL({ format: 'png', dynamic: true }) });

                                const channel_comandos = guild.channels.cache.get(Servidores[c].ID_Canal_Comandos);
                                RemoveListener_Token(Servidores[c].ID, Servidores[c].Tokens[b].ID);
                                Servidores[c].Tokens.splice(b, 1);
                                return channel_comandos.send({ embeds: [embed] });
                            }

                            const embed = new EmbedBuilder()
                                .setColor('#0099ff')
                                .setTitle('💸 Última Transação 💸')
                                .setDescription('Aqui está a última transação feita:')
                                .setThumbnail(Servidores[c].Tokens[b].Jetton.image)
                                .setFields([
                                    { name: '💎 Nome:', value: `${Servidores[c].Tokens[b].Jetton.name || 'Não disponível'}`, inline: false },
                                    { name: '💰 Valor Total:', value: `${formatar_number(Todas_Transacoes[t].in_msg.decoded_body.amount) || 'Não disponível'} ${Servidores[c].Tokens[b].Jetton.symbol}`, inline: false },
                                    { name: '📅 Data:', value: `${new Date(Todas_Transacoes[t].utime * 1000).toLocaleString() || 'Não disponível'}`, inline: false },
                                    { name: '✅ Status:', value: `${Todas_Transacoes[t].end_status || 'Não disponível'}`, inline: false },
                                    { name: '🔄 Tipo de Transação:', value: `${Todas_Transacoes[t].transaction_type || 'Não disponível'}`, inline: false }
                                ])
                                .setTimestamp()
                                .setFooter({ text: `Atualizado por ${bot.user.username}`, iconURL: bot.user.displayAvatarURL({ format: 'png', dynamic: true }) });

                            const button = new ButtonBuilder()
                                .setURL(`https://tonviewer.com/transaction/${Todas_Transacoes[t].hash}`)
                                .setLabel('Tx')
                                .setStyle(ButtonStyle.Link);

                            channel.send({ embeds: [embed], components: [{ type: 1, components: [button] }] })
                                // .then(() => console.log('Mensagem enviada com sucesso!'))
                                // .catch(console.error);

                        } catch (error) {
                            console.error(`Erro ao atualizar a transação do servidor: ${Servidores[c].ID} com token: ${Servidores[c].Tokens[b].ID}: ${error}`);
                        }
                    }
                } else {
                    // console.log('---------- Nenhuma Transação ----------');
                }
            }
        } else {
            break;
        }
    }

    // ! Chama a função novamente após a execução ser finalizada
    await Check_Transactions();
}


//! ------------------------------------- Retornar Jetton --------------------------

async function Retornar_Jetton(Servidor_ID, Token) {
    
    return new Promise(async (resolve, reject) => {
        let servidor_atual = Esse_Servidor(Servidor_ID)
        let InfoToken 
        
        for (let c = 0; c < servidor_atual.Tokens.length; c++) {
            if(servidor_atual.Tokens[c].ID == Token) {
                InfoToken = servidor_atual.Tokens[c]
                break
            }
        }

        await getJettonInfo(Token).then(data => {            

            // Cria um embed com as informações da jetton
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🪙 Informações do Jetton 🚀')
                .setDescription('Aqui estão os detalhes mais recentes sobre o seu token! 🌟')
                .setThumbnail(data.metadata.image)
                .setFields([
                    {
                    name: '📝 Nome do Jetton',
                    value: data.metadata.name,
                    inline: true
                    },
                    {
                    name: '🔠 Símbolo',
                    value: data.metadata.symbol,
                    inline: true
                    },
                    {
                    name: '💰 Saldo',
                    value: `${formatar_number(data.total_supply)} ${data.metadata.symbol}`, // Ajuste conforme necessário
                    inline: true
                    },
                    // {
                    // name: '💵 Preço Atual (USD)',
                    // value: `$${data.balances[0].price.prices.USD}`,
                    // inline: true
                    // },
                    // {
                    // name: '📉 Variação 24h',
                    // value: `${data.balances[0].price.diff_24h.USD}`,
                    // inline: true
                    // },
                    // {
                    // name: '📉 Variação 7d',
                    // value: `${data.balances[0].price.diff_7d.USD}`,
                    // inline: true
                    // },
                    // {
                    // name: '📈 Variação 30d',
                    // value: `${data.balances[0].price.diff_30d.USD}`,
                    // inline: true
                    // },
                    {
                    name: '🏠 Endereço do Wallet',
                    value: data.metadata.address,
                    inline: false
                    },
                    {
                    name: '⚠️ Status do Wallet',
                    value: data.admin.is_scam ? '⚠️ Scam' : '✅ Não Scam',
                    inline: true
                    },
                    {
                        name: '#️⃣ Canal De Transações: ',
                        value: `<#${InfoToken.Canal}>`,
                        inline: false
                    }
                ])
                .setTimestamp()
                .setFooter({ text: `Atualizado por ${bot.user.username} 🌟`, iconURL: bot.user.displayAvatarURL({ format: 'png', dynamic: true }) })


            const Mudar_Canal_Transacao = new ButtonBuilder()
                .setCustomId(`trocar_canal:${servidor_atual.ID} ${Token}`)
                .setLabel('Trocar O Canal De Transações')
                .setStyle(ButtonStyle.Primary)


            const Btn_Ver_Token = new ButtonBuilder()
                .setURL(`https://tonviewer.com/${Token}`)
                .setLabel('Buscar O Token (Pesquise)')
                .setStyle(ButtonStyle.Link)


            const Btn_Wallet = new ButtonBuilder()
                .setURL(`https://tonviewer.com/${data.metadata.address}`)
                .setLabel('Buscar A Carteira (Pesquise)')
                .setStyle(ButtonStyle.Link)


            const Btn_Remover_Token = new ButtonBuilder()
                .setCustomId(`remover_token:${servidor_atual.ID} ${Token}`)
                .setLabel('Remover O Token Do Servidor')
                .setStyle(ButtonStyle.Danger)


            //  const guild = bot.guilds.cache.get(Servidor_ID)
            // if (!guild) {
            //     console.log('Servidor não encontrado.')
            //     return reject('Servidor não encontrado.')
            // }

            // // Obtém o canal
            // const channel = guild.channels.cache.get(InfoToken.Canal)
            // if (!channel) {
            //     console.log('Canal não encontrado.')
            //     return reject('Canal não encontrado.')
            // }

            const rows = []
            const array_btns = [Mudar_Canal_Transacao, Btn_Remover_Token, Btn_Ver_Token, Btn_Wallet]
            while (array_btns.length > 0) {
                const rowButtons = array_btns.splice(0, 2)
                const row = new ActionRowBuilder().addComponents(rowButtons)
                rows.push(row)
            }
            
            let obj = {
                Embed: [embed],
                Components: rows
            }

            return resolve(obj)

        }).catch(err => {
            console.error('Erro ao obter informações do Jetton:', err);
            return reject('Houve um erro ao obter as informações do Jetton. 😔')
        })
    })
}