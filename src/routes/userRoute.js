import { Router } from 'express'
import { signUp, signIn, signOut} from '../controllers/userController.js'

const router = Router()

router.post('/sign-up', signUp) 
router.post('/sign-in', signIn)
router.delete('/sign-out', signOut)

export default router