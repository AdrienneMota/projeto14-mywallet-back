import { Router } from 'express'
import { createRegistries, getRegistries} from '../controllers/registryController.js'

const router = Router()

router.post('/registries', createRegistries) 
router.get('/registries', getRegistries)

export default router