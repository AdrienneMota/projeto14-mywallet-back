import express from "express"
import { MongoClient } from "mongodb"
import joi from "joi"
import cors from "cors"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import {v4 as creatToken} from "uuid"

const useSchema = joi.object({
    name: joi.string().max(3).max(100).required(),
    email: joi.string().email().required(),
    password: joi.string().min(1).required()
})

//criacao api
const app = express()
//configurações
app.use(cors())//erro cors
app.use(express.json())//ler json
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
const users = db.collection('users')

app.post('/sign-up', async (req, res) => {
    const user = req.body

    try {        
        const emailExist = await users.findOne({email: user.email})
        if(emailExist){
            return res.status(409).send('Email já cadastrado')
        }
        const { error } = useSchema.validate(user, { abortEarly: false })
        if(error){
            const erros = error.details.map(detail => detail.message)
            return res.status(400).send(erros)
        }

        const hashPassword = bcrypt.hashSync(user.password, 10)

        await users.insertOne({...user, password: hashPassword})
        
        res.sendStatus(201)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

app.post('/sign-in', (req, res) => {
    const user = req.body
})

//função para indicar em qual porta o front deve abrir para se comunicar com esta api
app.listen(5000, () => console.log(`Serve is running in port: ${5000}`))

 

