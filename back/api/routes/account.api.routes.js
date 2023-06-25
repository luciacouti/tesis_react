import { Router } from "express"
// import * as service from '../../services/account.services.js'
import * as controller from '../controllers/account.controllers.js'
import * as validate from '../../middlewares/account.validate.middleware.js'
import { tokenVerify } from '../../middlewares/token.validate.middleware.js'


const router = Router()

// registrarse
// /account/regiter
router.post('/account', [validate.validateAccount], controller.createAccount)

router.get('/profile', [tokenVerify], controller.getProfile)
router.post('/profile', [tokenVerify, validate.validateProfile], controller.createProfile)


// autentificar un usuario
router.post('/session', [validate.validateAccount], controller.login)
router.delete('/session', [tokenVerify], controller.logout)

/// TOKEN


export default router