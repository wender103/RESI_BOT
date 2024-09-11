// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app")
const { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, updateDoc } = require('firebase/firestore') // Mudei para a versão completa
const dotenv = require("dotenv");
dotenv.config()

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.APIKEY,
  authDomain: process.env.AUTHDOMAIN,
  projectId: process.env.PROJECTID,
  storageBucket: process.env.STORAGEBUCKET,
  messagingSenderId: process.env.MESSAGINGSENDERID,
  appId: process.env.APPID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

//* Retorna todos os valores da coleção informada
function getCollectionData(collectionName) {
  return getDocs(collection(db, collectionName))
    .then(snapshot => {
      const dataList = snapshot.docs.map(doc => doc.data())
      return dataList
    })
    .catch(error => {
      console.error(`Erro ao obter dados da coleção "${collectionName}":`, error)
      return []
    })
}

//* Cria um novo documento com as informações passadas por parametro
async function addDocumentToCollection(collectionName, docId, obj) {
  try {
    // Referência ao documento com o ID especificado
    const docRef = doc(db, collectionName, docId)

    // Adiciona ou atualiza o documento com o conteúdo do objeto
    await setDoc(docRef, obj)

    console.log(`Documento com ID "${docId}" adicionado à coleção "${collectionName}".`)
  } catch (error) {
    console.error(`Erro ao adicionar documento à coleção "${collectionName}":`, error)
  }
}

//* Deleta o documento da coleção informada
async function removeDocumentFromCollection(collectionName, docId) {
  try {
    // Referência ao documento com o ID especificado
    const docRef = doc(db, collectionName, docId)

    // Remove o documento
    await deleteDoc(docRef)

    console.log(`Documento com ID "${docId}" removido da coleção "${collectionName}".`)
  } catch (error) {
    console.error(`Erro ao remover documento da coleção "${collectionName}":`, error)
  }
}

//* Atualiza um valor no doc
async function updateDocumentInCollection(collectionName, docId, updates) {
  try {
    // Atualiza o documento no Firestore
    const docRef = doc(db, collectionName, docId)
    await updateDoc(docRef, updates)
    console.log(`Documento com ID "${docId}" na coleção "${collectionName}" foi atualizado.`)
    
  } catch (error) {
    console.error(`Erro ao atualizar documento na coleção "${collectionName}":`, error)
  }
}

module.exports = { getCollectionData, addDocumentToCollection, removeDocumentFromCollection, updateDocumentInCollection, }