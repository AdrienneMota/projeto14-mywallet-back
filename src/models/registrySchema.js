import joi from "joi"

const registrySchema = joi.object({
    description: joi.string().min(3).required(),
    value: joi.number().required(),
    type: joi.string().valid('entrada', 'saida').required()
})

export default registrySchema