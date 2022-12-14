import bcrypt from "bcrypt"
import {v4 as creatToken} from "uuid"

import {users, sessions} from "../database/db.js"
import userSchema from "../models/userSchema.js"

export const signUp = async (req, res) => {
    const user = req.body

    try {        
        const emailExist = await users.findOne({email: user.email})
        if(emailExist){
            return res.status(409).send({message:'Email já cadastrado'})
        }
        const { error } = userSchema.validate(user, { abortEarly: false })
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
}

export const signIn = async (req, res) => {
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

        const sessionOpened = await sessions.findOne({ userId: userExist._id })
        if(sessionOpened){
            const token = sessionOpened.token
            return res.send(token)
        }   

        await sessions.insertOne({token, userId: userExist._id})
        res.send(token)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
}

export const signOut = async(req, res) => {
    const token = req.token

    try {
        await sessions.deleteOne({token})
        res.sendStatus(200)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
}