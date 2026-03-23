import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()
const authController = new AuthController()

// Public routes - Register disabled (admin only via database)
// router.post('/register', (req, res, next) => authController.register(req, res, next))
router.post('/login', (req, res, next) => authController.login(req, res, next))

// Protected routes
router.post('/logout', (req, res, next) => authController.logout(req, res, next))
router.post('/refresh', (req, res, next) => authController.refresh(req, res, next))
router.get('/me', authMiddleware, (req, res, next) => authController.me(req, res, next))

export default router
