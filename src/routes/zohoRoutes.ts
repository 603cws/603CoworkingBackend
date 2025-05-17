import { Router } from 'express';
import {
  createBookingOnZoho,
  getBookings,
  getlayouts,
  zohoFormWebHook,
} from '../controllers/zohoController';
const router = Router();

router.get('/fetchLayout', getlayouts);
router.post('/createBooking', createBookingOnZoho);
router.get('/getBooking', getBookings);

//webhook
router.post('/submitForm', zohoFormWebHook);

export default router;
