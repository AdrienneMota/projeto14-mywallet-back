import express from "express"
import { MongoClient, ObjectId } from "mongodb"
import joi from "joi"
import cors from "cors"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import {v4 as creatToken} from "uuid"
import dayjs from "dayjs"

const useSchema = joi.object({
    name: joi.string().max(3).max(100).required(),
    email: joi.string().email().required(),
    password: joi.string().min(1).required()
})

const registrySchema = joi.object({
    description: joi.string().min(3).required(),
    value: joi.number().required(),
    type: joi.string().valid('entrada', 'saida').required()
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
const registries = db.collection('registries')

//ROTAS//////////////////////////////////////////

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

app.post('/sign-in', async (req, res) => {
    const {email, password} = req.body
    const token = creatToken()

    try {
        const userExist = await users.findOne({ email })
        if(!userExist){
            return res.status(401).send({message: "usuário inexistente"})
        }

        const hashPassword = bcrypt.compareSync(password, userExist.password)
        if(!hashPassword){
            return res.status(401).send({message: "senha incorreta"})
        }

        const sessionOpened = await db.collection('sessions').findOne({ userId: userExist._id })//eu poderia usar o token inves do userId
        if(sessionOpened){
            return res.status(401).send({message: "Você já está logado, saia para logar novamente"})
        }   

        await db.collection('sessions').insertOne({token, userId: userExist._id})
        res.send(token)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

app.post('/registries', async (req, res) => {
    const {authorization} = req.headers
    const registry = req.body

    try {     
        const token = authorization?.replace('Bearer ', '')   
        if(!token){
            return res.status(401).send({message: 'Usuário não autorizado'})
        }   
    
        const {error} = registrySchema.validate(registry, {abortEarly: false})
        if(error){
            const erros = error.details.map(detail => detail.message)
            return res.status(400).send(erros)
        }
        
        const sessionUser = await db.collection('sessions').findOne({token})
        await registries.insertOne({...registry, userId: sessionUser.userId, date: dayjs().format('DD/MM')})        
        res.sendStatus(201)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
    
})

app.get('/registries', async (req, res) => {
    const { authorization } = req.headers

    try {
        const token = authorization?.replace('Bearer ', '')
        if(!token){
            return res.status(401).send({message: "usuário não autorizado"})
        }
    
        
        const sessionUser = await db.collection('sessions').findOne({token})
        const user = users.findOne({_id: sessionUser?.userId})
        if(!user){
            return res.sendStatus(401)
        }

        const registriesUser = await registries.find({userId: sessionUser.userId}).toArray()

        res.send(registriesUser)

    } catch (error) {
        console.log(error)
        return res.sendStatus(500)
    } 
})

app.delete('/sign-out', async(req, res) => {
    const { authorization } = req.headers

    try {
        const token = authorization?.replace('Bearer ', '')
        if(!token){
            return res.status(401).send({message: "usuário não autorizado"})
        }

        await db.collection('sessions').deleteOne({token})
        res.status(200).send("deu bom")
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
})

//função para indicar em qual porta o front deve abrir para se comunicar com esta api
app.listen(5000, () => console.log(`Serve is running in port: ${5000}`))

 

