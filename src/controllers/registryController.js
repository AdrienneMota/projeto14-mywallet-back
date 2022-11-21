import dayjs from "dayjs"

import registrySchema from "../models/registrySchema.js"
import { sessions, registries, users } from "../database/db.js"

export const createRegistries = async (req, res) => {

    const registry = req.body
    const token = req.token
    try {

        const { error } = registrySchema.validate(registry, { abortEarly: false })
        if (error) {
            const erros = error.details.map(detail => detail.message)
            return res.status(400).send(erros)
        }

        const sessionUser = await sessions.findOne({ token })
        const oldRegistries = await registries.find({ userId: sessionUser.userId }).toArray()
        let balance

        if (oldRegistries.length) {
            const existEntrada = oldRegistries.find((r) => r.type === "entrada")
            const existSaida = oldRegistries.find((r) => r.type === "saida")
            let entradas, saidas

            if (existEntrada) {
                entradas = oldRegistries.filter((registry) => registry.type === 'entrada')
                    .map((entrada) => entrada.value)
                    .reduce((total, entrada) => total + entrada)
            }
            else {
                entradas = 0
            }

            if (existSaida) {
                saidas = oldRegistries.filter((registry) => registry.type === 'saida')
                    .map((saida) => saida.value)
                    .reduce((total, saida) => total + saida)
            } else {
                saidas = 0
            }
            
            if(registry.type === "entrada"){
                balance = (entradas - saidas) + registry.value
            }else{
                balance = (entradas - saidas) - registry.value
            }
        } else {
            if (registry.type === "entrada") {
                balance = registry.value
            } else {
                balance = (0 - registry.value)
            }
        }

        


        await registries.insertOne({ ...registry, balance, userId: sessionUser.userId, date: dayjs().format('DD/MM') })
        res.sendStatus(201)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
}

export const getRegistries = async (req, res) => {
    const token = req.token

    try {

        const sessionUser = await sessions.findOne({ token })
        const user = await users.findOne({ _id: sessionUser?.userId })
        if (!user) {
            return res.sendStatus(401)
        }

        const registriesUser = await registries.find({ userId: sessionUser.userId }).toArray()

        res.send({ registriesUser, name: user.name })

    } catch (error) {
        console.log(error)
        return res.sendStatus(500)
    }
}
