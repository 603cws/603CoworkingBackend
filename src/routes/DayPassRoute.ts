import { Router } from 'express';
import {
  DayPassBooking,
  getdaypassbookings,
  getDaypassesOfUser,
  createDaypass,
  checkDaypassAvaiableForLocation,
  checkincordecofdaypassavaialble,
} from '../controllers/DayPassController';
const router = Router();

router.post('/bookdaypass', DayPassBooking);
router.post('/getdata', getdaypassbookings);
router.post('/getalldaypassbyuser', getDaypassesOfUser);
router.post('/createDaypass', createDaypass);

//check if daypass avaialble
router.post('/daypassCheck', checkDaypassAvaiableForLocation);

//check if inc and dec working
router.post(
  '/checkincordecofdaypassavaialble',
  checkincordecofdaypassavaialble
);

export default router;
