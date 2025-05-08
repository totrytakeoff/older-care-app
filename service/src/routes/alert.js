import express from 'express'
import alertController from '../controllers/alert.js'


const router = express.Router()

router.get('/:userId', alertController.getAlerts)
router.post('/trigger', alertController.triggerAlert)
router.post('/update', alertController.updateAlert)



export default router
