const { PermissionsBitField  } = require('discord.js')
const axios = require('axios');

const { updateDocumentInCollection } = require('../firebase/firebase.js')
let Servidores = []

// Função para obter o valor de Servidores
function getServidores() {
  return Servidores
}

// Função para definir o valor de Servidores
function setServidores(newServidores, ID=undefined) {
  Servidores = newServidores
  if(ID != undefined) {
    for (let c = 0; c < Servidores.length; c++) {
      if(Servidores[c].ID == ID) {
        updateDocumentInCollection('Servidores', ID, Servidores[c])
        break
      }      
    }
  }
}

function Esse_Servidor(ID) {
  let Servidores = getServidores()
  for (let c = 0; c < Servidores.length; c++) {
    if(Servidores[c].ID == ID) {
      return Servidores[c]
    }
  }
}

// function Esse_Servidor(msg, canal=false) {
//   let Servidores = getServidores()
//   for (let c = 0; c < Servidores.length; c++) {
//     if(!canal) {
//       if(Servidores[c].ID == msg.guildId) {
//         return Servidores[c]
//       }
//     } else {
//       if(Servidores[c].ID == msg.id) {
//         return Servidores[c]
//       }
//     }
//   }
// }

//* Função para validar o token. Ajuste a expressão regular conforme o formato esperado.
function Validar_Token(token) {
  //* Permite letras, números, sublinhados e barras, e comprimento mínimo de 40 caracteres
  const tokenRegex = /^[A-Za-z0-9-_]{40,}$/
  return tokenRegex.test(token)
}

async function Retornar_Holders(token) {
  try {
    // URL da API com o token substituído no path
    const url = `https://tonapi.io/v2/jettons/${token}/holders`

    // Fazendo a requisição GET para a API
    let response = await axios.get(url)
    response = response.data
  
    return response
  } catch (error) {
    // Se houver um erro, loga e retorna uma mensagem de erro
    console.error(`Erro ao tentar encontrar os Holders: ${error}`)
    return { error: 'Não foi possível obter informações dos Holders' }
  }
}


//* Vai adicionar o token
async function Adicionar_Token(tokenInputValue, canalTokenValue, ID) {
  let token = tokenInputValue.trim()

  // Função auxiliar para processar transações de um holder
  const processHolderTransactions = async (Holder, Todas_Transacoes) => {
    try {
      const data = await getAccountTransactions(Holder)
      Todas_Transacoes.push(...data.transactions)
    } catch (error) {
      console.error(`Erro ao tentar salvar a última transação do holder ${Holder}: ${error}`)
    }
  }

  try {
    let Servidores = getServidores()

    if (!Validar_Token(token)) {
      return { sucesso: false, msg: '🚨 Oops! 😱 O formato do token está incorreto. ❌🔑 Por favor, verifique e tente novamente. 🛠️🔄' }
    }

    let data = await getJettonInfo(token)
    data = data.metadata

    if (data.error) {
      return { sucesso: false, msg: '🚨 Oops! 😱 Houve um erro ao tentar salvar o **jetton** deste token. ❌🔑 Verifique o formato e tente novamente. 🛠️🔄' }
    }

    let data_holders = await Retornar_Holders(token)
    if (data_holders.error) {
      return { sucesso: false, msg: '🚨 Oops! 😱 Houve um erro ao tentar salvar os **Holders** deste token. ❌🔑 Verifique o formato e tente novamente. 🛠️🔄' }
    }

    // Filtra e coleta os addresses dos holders
    let IDs_Holders = data_holders.addresses
      .filter(address => !address.owner.is_wallet)
      .map(address => address.address)

    let Todas_Transacoes = []

    // Processa as transações dos holders com atraso
    const holdersPromises = IDs_Holders.map(Holder => processHolderTransactions(Holder, Todas_Transacoes))
    await Promise.all(holdersPromises)

    Todas_Transacoes = sortTransactionsByUtime(Todas_Transacoes)
    const lastTransactionHash = Todas_Transacoes.length > 0 ? Todas_Transacoes[0].hash : null

    let new_token = {
      ID: token,
      Canal: canalTokenValue,
      Jetton: data,
      Last_Transaction: lastTransactionHash,
      Holders: IDs_Holders,
    }

    // Atualiza o servidor com o novo token
    let server = Servidores.find(server => server.ID === ID)
    if (server) {
      server.Tokens.push(new_token)
      setServidores(Servidores, ID)
      return { sucesso: true, msg: '🎉 Sucesso! 🎉 O token foi salvo corretamente! ✅🔑' }
    } else {
      return { sucesso: false, msg: '🚨 Oops! 😱 Servidor não encontrado. ❌🔑' }
    }

  } catch (error) {
    console.error('Erro ao tentar adicionar o token:', error)
    return { sucesso: false, msg: '🚨 Oops! 😱 Houve um erro ao tentar salvar o token. ❌🔑 Por favor, tente novamente. 🛠️🔄' }
  }
}


//* Vai salvar o canal no qual o bot vai receber comandos
function Adicionar_Canal_Comandos(canalInputValue, ID) {
  return new Promise((resolve, reject) => {
    for (let c = 0; c < Servidores.length; c++) {
        if(Servidores[c].ID == ID) {
          Servidores[c].ID_Canal_Comandos = canalInputValue
          setServidores(Servidores, ID)
          resolve({sucesso: true, msg:'🎉 Sucesso! 🎉 O canal foi salvo! Agora o bot só receberá comandos por lá ✅🔑'})
          break
        }
      }
  })
}

// Função para obter informações de um jetton a partir de um token
async function getJettonInfo(token) {
  try {
    // URL da API com o token substituído no path
    const url = `https://tonapi.io/v2/jettons/${token}`;

    // Fazendo a requisição GET para a API
    const response = await axios.get(url);

    // Retorna os dados obtidos da API
    return response.data
  } catch (error) {
    // Se houver um erro, loga e retorna uma mensagem de erro
    console.error(`Erro ao obter informações do jetton: ${error}`)
    return { error: 'Não foi possível obter informações do jetton' }
  }
}

//* Marca o usuário na msg
function Mencionar_User(msg) {
    // Obtenha o ID do autor da mensagem
    const userId = msg.author.id

    // Crie a menção com o ID do usuário
    return `<@${userId}>`
}

function hasAdminRole(ctx) {
  // Verifica se ctx é uma interação
  if (ctx.member) {
    // Para interações, ctx.member estará disponível
    return ctx.member.permissions.has(PermissionsBitField.Flags.Administrator)
  } else if (ctx.guild && ctx.user) {
    // Para mensagens, obter o membro do servidor usando o ID do usuário
    const member = ctx.guild.members.resolve(ctx.user.id)
    if (member) {
      return member.permissions.has(PermissionsBitField.Flags.Administrator)
    }
  }

  // Retorna false se o membro não for encontrado
  return false
}

// Função para obter transações de uma conta a partir de um endereço
async function getAccountTransactions(token, delay = 100) {
  try {
    // Cria uma nova Promise que será resolvida após o delay
    const result = await new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          // URL da API com o endereço substituído no path
          const url = `https://tonapi.io/v2/blockchain/accounts/${token}/transactions`;
          
          // Fazendo a requisição GET para a API
          const response = await axios.get(url);
          
          // Resolve a Promise com os dados obtidos da API
          resolve(response.data);
        } catch (error) {
          // Rejeita a Promise se houver um erro
          reject(error);
        }
      }, delay);
    });

    return result;
  } catch (error) {
    // Se houver um erro, loga e retorna uma mensagem de erro
    console.error(`Erro ao obter transações da conta: ${error}`);
    return { error: 'Não foi possível obter as transações da conta' };
  }
}

//* Checa se o servidor informado já foi configurado
function JaConfigurado(ID) {
  let servidor_atual = Esse_Servidor(ID)

  if(servidor_atual.ID_Canal_Comandos && servidor_atual.Tokens.length > 0) {
    return true
  }

  return false
}

function formatar_number(number) {
  // Divide o número por 100 para ajustar a unidade e arredonda para duas casas decimais
  const adjustedNumber = (number / 1000000000).toFixed(2)

  // Divide o número em parte inteira e decimal
  const [inteiro, decimal] = adjustedNumber.split('.')

  // Adiciona os pontos a cada 3 dígitos da parte inteira
  const parteInteiraFormatada = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  
  const resultado = `${parteInteiraFormatada},${decimal}`
  return resultado

}

function RemoveListener_Token(Server_ID, Token) {
  let Servidores = getServidores()

  for (let c = 0; c < Servidores.length; c++) {
    if (Servidores[c].ID == Server_ID) {
      for (let b = 0; b < Servidores[c].Tokens.length; b++) {
        if (Servidores[c].Tokens[b].ID == Token) {
          Servidores[c].Tokens.splice(b, 1)
          setServidores(Servidores, Server_ID)
          return '🎉 Token Removido com Sucesso! 🗑️'
        }
      }

      break
    }
  }
   
  return '🚫 Falha ao Remover o Token ❌'
}

function Alterar_Canal_Transacoes(Server_ID, Token, Canal_ID) {
  let Servidores = getServidores()

  for (let c = 0; c < Servidores.length; c++) {
    if (Servidores[c].ID == Server_ID) {
      for (let b = 0; b < Servidores[c].Tokens.length; b++) {
        if (Servidores[c].Tokens[b].ID == Token) {
          Servidores[c].Tokens[b].Canal = Canal_ID
          setServidores(Servidores, Server_ID)
          return '🎉 Canal De Transações Alterado Com Sucesso! 💵'
        }
      }

      break
    }
  }
   
  return '🚫 Falha Ao Alterar O Canal De Transações ❌'
}

function Alterar_Prefix_Do_Servidor(Server_ID, Novo_Prefix) {
  let Servidores = getServidores()

  for (let c = 0; c < Servidores.length; c++) {
    if (Servidores[c].ID == Server_ID) {
      Servidores[c].Prefix = Novo_Prefix
      setServidores(Servidores, Server_ID)
      return '🎉 Prefixo Alterado Com Sucesso! 💵'
    }
  }

  return '🚫 Falha Ao Alterar O Prefixo Do Servidor ❌'
}

function JaTemEsseToken(serverID, Token) {
  let Servidores = getServidores()

  for (let c = 0; c < Servidores.length; c++) {
    if(Servidores[c].ID == serverID) {
      
      for (let b = 0; b < Servidores[c].Tokens.length; b++) {
        if(Servidores[c].Tokens[b].ID == Token) {          
          return true
        }
      }
      break
    }    
  }

  return false
}

//* Organiza as transações pelo utime de modo a ficar das transações mais recentes para as mais antigas
function sortTransactionsByUtime(transactions) {
  return transactions.sort((a, b) => b.utime - a.utime)
}

//* Retorna as transações após o ultimo hash
function getTransactionsAfterHash(transactions, hash) {
  // Encontra o índice da transação com o hash fornecido
  const index = transactions.findIndex(transaction => transaction.hash === hash)

  // Se o hash não for encontrado, retorna um array vazio
  if (index === -1) {
    return []
  }

  // Retorna todas as transações mais recentes após a transação com o hash fornecido
  return transactions.slice(0, index)
}

//* Testa se é um símbolo
function checarSimbolo(str) {
  return /[!@#$%^&*(),.?":{}|<>]/.test(str)
}

function Delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { Mencionar_User, getJettonInfo, hasAdminRole, getAccountTransactions, JaConfigurado, getServidores, setServidores, Esse_Servidor, Adicionar_Token, Adicionar_Canal_Comandos, formatar_number, RemoveListener_Token, Alterar_Canal_Transacoes, JaTemEsseToken, sortTransactionsByUtime, getTransactionsAfterHash, checarSimbolo, Alterar_Prefix_Do_Servidor, Delay }