"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const UserControllers_1 = require("../controllers/UserControllers");
const adminMiddleware_1 = require("../middlewares/adminMiddleware");
const router = (0, express_1.Router)();
router.post('/', UserControllers_1.createuser);
router.get('/', authMiddleware_1.protect, UserControllers_1.getusers);
router.get('/userdetails', authMiddleware_1.protect, UserControllers_1.getuserdetails);
router.delete('/:id', authMiddleware_1.protect, UserControllers_1.deleteuser);
router.post('/setnewpass', UserControllers_1.changeforgotpass);
router.post('/forgotpassLink', UserControllers_1.forgotPassword);
router.put('/changepassword', UserControllers_1.changepasswordbyuser);
router.put('/updateuser', authMiddleware_1.protect, UserControllers_1.updateuser);
router.get('/details/dashboard', adminMiddleware_1.admin, UserControllers_1.allusersbyadmin);
router.get('/checkauth', UserControllers_1.checkauth);
router.post('/sendcallback', UserControllers_1.sendcallback);
router.post('/contactus', UserControllers_1.contactus);
router.post('/admin/updateuser', adminMiddleware_1.admin, UserControllers_1.updateuserbyadmin);
router.post('/admin/deleteuser', adminMiddleware_1.admin, UserControllers_1.deleteuserbyadmin);
//get a particular user by admin
router.post('/getUserByAdmin', UserControllers_1.getuserDetailsByAdmin);
//send email to admin for request a tour
router.post('/requestTour', UserControllers_1.requestTour);
//send a email to admin and user for contact us for 603 interior
router.post('/contactusInterior', UserControllers_1.contactusInterior);
//update user details
exports.default = router;
