import { Router } from 'express'
import { signUp, signIn, signOut} from '../controllers/userController.js'
import tokenValidation from '../middlewares/tokenValidation.js'

const router = Router()

router.post('/sign-up', signUp) 
router.post('/sign-in', signIn)
router.delete('/sign-out', tokenValidation, signOut)

export default router