import { MongoClient, ObjectId } from "mongodb"
import dotenv from "dotenv"

dotenv.config()//possibilita usar o .env

const mongoClient = new MongoClient(process.env.MONGO_URI) //indicando o local do banco

//estabelecimento de conexão com o mongodb do banco
try {
    await mongoClient.connect()
} catch (error) {
    console.log(error)
}
//criando variáveis globais
const db = mongoClient.db('dbMywallet')
export const users = db.collection('users')
export const registries = db.collection('registries')
export const sessions = db.collection('sessions')
