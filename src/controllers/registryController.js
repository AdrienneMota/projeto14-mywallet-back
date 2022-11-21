import dayjs from "dayjs"

import registrySchema from "../models/registrySchema.js"
import { sessions, registries, users } from "../database/db.js"

export const createRegistries = async (req, res) => {
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
        
        const sessionUser = await sessions.findOne({token})
        await registries.insertOne({...registry, userId: sessionUser.userId, date: dayjs().format('DD/MM')})        
        res.sendStatus(201)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }    
}

export const getRegistries = async (req, res) => {
    const { authorization } = req.headers

    try {
        const token = authorization?.replace('Bearer ', '')
        if(!token){
            return res.status(401).send({message: "usuário não autorizado"})
        }
    
        
        const sessionUser = await sessions.findOne({token})
        const user = await users.findOne({_id: sessionUser?.userId})
        if(!user){
            return res.sendStatus(401)
        }
   
        const registriesUser = await registries.find({userId: sessionUser.userId}).toArray()

        res.send({registriesUser, name: user.name})

    } catch (error) {
        console.log(error)
        return res.sendStatus(500)
    } 
}
