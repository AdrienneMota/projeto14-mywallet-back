import { Router } from 'express'
import { createRegistries, getRegistries} from '../controllers/registryController.js'
import tokenValidation from '../middlewares/tokenValidation.js'

const router = Router()

router.post('/registries', tokenValidation, createRegistries) 
router.get('/registries', tokenValidation, getRegistries)

export default router