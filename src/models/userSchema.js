import joi from "joi"

const userSchema = joi.object({
    name: joi.string().max(3).max(100).required(),
    email: joi.string().email().required(),
    password: joi.string().min(1).required()
})

export default userSchema