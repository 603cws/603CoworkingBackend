"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DayPassController_1 = require("../controllers/DayPassController");
const router = (0, express_1.Router)();
router.post('/bookdaypass', DayPassController_1.DayPassBooking);
router.post('/getdata', DayPassController_1.getdaypassbookings);
router.post('/getalldaypassbyuser', DayPassController_1.getDaypassesOfUser);
router.post('/createDaypass', DayPassController_1.createDaypass);
//check if daypass avaialble
router.post('/daypassCheck', DayPassController_1.checkDaypassAvaiableForLocation);
//check if inc and dec working
router.post('/checkincordecofdaypassavaialble', DayPassController_1.checkincordecofdaypassavaialble);
exports.default = router;
