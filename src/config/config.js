const { updateDocumentInCollection } = require('../firebase/firebase.js')
const { getJettonInfo } = require('../utils/utils.js')
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

//* Vai adicionar o token
async function Adicionar_Token(tokenInputValue, canalTokenValue, ID) {

  return new Promise(async (resolve, reject) => {
    try {
      const data = await getJettonInfo(token)

      let Servidores = getServidores()

      if(Validar_Token(tokenInputValue)) {
        let new_token = {
          Canal: canalTokenValue,
          Token: tokenInputValue,
          Last_Transaction: null,
          Jetton: data
        }

        for (let c = 0; c < Servidores.length; c++) {
          if(Servidores[c].ID == ID) {
            Servidores[c].Tokens.push(new_token)
            setServidores(Servidores, ID)
            resolve({sucesso: true, msg:'🎉 Sucesso! 🎉 O token foi salvo corretamente! ✅🔑'})
            break
          }
        }
      } else {
        resolve({ sucesso: false, msg: '🚨 Oops! 😱 Houve um erro ao tentar salvar o token. ❌🔑 Por favor, verifique se o formato está correto e tente novamente. 🛠️🔄 Se precisar de ajuda, estou aqui! 💬🙂' })
      }

    } catch (error) {
      resolve({ sucesso: false, msg: '🚨 Oops! 😱 Houve um erro ao tentar salvar o jetton deste token. ❌🔑 Por favor, verifique se o formato está correto e tente novamente. 🛠️🔄 Se precisar de ajuda, estou aqui! 💬🙂' })
    }
  })
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


module.exports = { getServidores, setServidores, Esse_Servidor, Adicionar_Token, Adicionar_Canal_Comandos }
