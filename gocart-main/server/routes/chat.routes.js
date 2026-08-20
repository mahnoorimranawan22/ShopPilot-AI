import { Router } from 'express'
import { getMessages, saveMessage, getChatRooms, markAsRead } from '../controllers/chat.controller.js'
import { protect, authorize } from '../middleware/auth.js'

const router = Router()

router.get('/rooms/list', protect, authorize('admin'), getChatRooms)
router.get('/:roomId', protect, getMessages)
router.post('/:roomId', protect, saveMessage)
router.put('/:roomId/read', protect, markAsRead)

export default router
