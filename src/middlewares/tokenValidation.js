const tokenValidation = async (req, res, next) => {
    
    const {authorization} = req.headers
    
    const token = authorization?.replace('Bearer ', '')   
    if(!token){
        return res.status(401).send({message: 'Usuário não autorizado'})
    } 
    
    req.token = token
    next()
}

export default tokenValidation