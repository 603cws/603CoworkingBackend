import { Router } from 'express';
import {
  create,
  createBookingPaymentDatabase,
  createdaypassesPaymentDatabase,
  validate,
  phonepeCallback,
  refundcallback,
  refund,
} from '../controllers/orderController';
import { isBookingOverlap } from '../middlewares/isBookedMiddleware';
import { corsEcape } from '../middlewares/authMiddleware';
//
const router = Router();

router.post('/createorder', create);
router.get('/status', validate);
router.post('/callback-url', phonepeCallback);
router.post('/cancelOnlineBooking', refund);
router.post('/refundcallback', refundcallback);
// router.get('/validateOrder/:merchantTransactionId', validateOrder);

router.post('/storebooking', createBookingPaymentDatabase);
router.post('/storeDaypasses', createdaypassesPaymentDatabase);
router.post('/checkOverlap', isBookingOverlap);

//testing route
// router.post("/testPaymentatore", storePaymentTestingApi);

export default router;
