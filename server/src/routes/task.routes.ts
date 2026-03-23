import { Router } from 'express'
import { TaskController } from '../controllers/task.controller.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()
const taskController = new TaskController()

// All task routes are protected
router.use(authMiddleware)

router.get('/', (req, res, next) => taskController.getTasks(req, res, next))
router.get('/counts', (req, res, next) => taskController.getCounts(req, res, next))
router.post('/', (req, res, next) => taskController.createTask(req, res, next))
router.put('/:id', (req, res, next) => taskController.updateTask(req, res, next))
router.delete('/:id', (req, res, next) => taskController.deleteTask(req, res, next))
router.patch('/:id/status', (req, res, next) => taskController.updateStatus(req, res, next))

export default router
