import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import {
  createuser,
  deleteuser,
  getusers,
  updateuser,
  userbyid,
  allusersbyadmin,
  changepasswordbyuser,
  getuserdetails,
  checkauth,
  sendcallback,
  contactus,
  updateuserbyadmin,
  deleteuserbyadmin,
  forgotPassword,
  changeforgotpass,
  getuserDetailsByAdmin,
  requestTour,
  contactusInterior,
} from '../controllers/UserControllers';
import { admin } from '../middlewares/adminMiddleware';

const router = Router();

router.post('/', createuser);
router.get('/', protect, getusers);
router.get('/userdetails', protect, getuserdetails);
router.delete('/:id', protect, deleteuser);

router.post('/setnewpass', changeforgotpass);
router.post('/forgotpassLink', forgotPassword);
router.put('/changepassword', changepasswordbyuser);
router.put('/updateuser', protect, updateuser);
router.get('/details/dashboard', admin, allusersbyadmin);
router.get('/checkauth', checkauth);
router.post('/sendcallback', sendcallback);
router.post('/contactus', contactus);
router.post('/admin/updateuser', admin, updateuserbyadmin);
router.post('/admin/deleteuser', admin, deleteuserbyadmin);

//get a particular user by admin
router.post('/getUserByAdmin', getuserDetailsByAdmin);

//send email to admin for request a tour
router.post('/requestTour', requestTour);

//send a email to admin and user for contact us for 603 interior
router.post('/contactusInterior', contactusInterior);

//update user details

export default router;
