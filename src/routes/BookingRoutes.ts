import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import { admin } from '../middlewares/adminMiddleware';
import {
  createBooking,
  getAllBookingsbyuser,
  getBookingById,
  getBookingsByUserId,
  updateBookingStatus,
  deleteBookingbyadmin,
  deleteBookingbyuser,
  getlocationbookings,
  allbookingbyadmin,
  getAllCancelledBookingsbyuser,
  onlinebookingbyadmin,
} from '../controllers/bookingControllers';

const router = Router();

router.post('/getlocationbookings', getlocationbookings);
router.get('/admin/getallbookings', admin, allbookingbyadmin);
router.get('/admin/getonlinebookings', onlinebookingbyadmin);
router.post('/', protect, createBooking);
router.get('/getallbookingsbyuser', protect, getAllBookingsbyuser);
router.get(
  '/getallcancellbookingsbyuser',
  protect,
  getAllCancelledBookingsbyuser
);
router.get('/:id', protect, getBookingById);
router.get('/user/:id', protect, getBookingsByUserId);
router.put('/:id', protect, updateBookingStatus);
router.post('/admin/deletebooking', admin, deleteBookingbyadmin);
router.post('/cancelbooking', protect, deleteBookingbyuser);

export default router;
