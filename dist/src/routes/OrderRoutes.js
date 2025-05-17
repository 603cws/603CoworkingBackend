"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const isBookedMiddleware_1 = require("../middlewares/isBookedMiddleware");
//
const router = (0, express_1.Router)();
router.post('/createorder', orderController_1.create);
router.get('/status', orderController_1.validate);
router.post('/callback-url', orderController_1.phonepeCallback);
router.post('/cancelOnlineBooking', orderController_1.refund);
router.post('/refundcallback', orderController_1.refundcallback);
// router.get('/validateOrder/:merchantTransactionId', validateOrder);
router.post('/storebooking', orderController_1.createBookingPaymentDatabase);
router.post('/storeDaypasses', orderController_1.createdaypassesPaymentDatabase);
router.post('/checkOverlap', isBookedMiddleware_1.isBookingOverlap);
//testing route
// router.post("/testPaymentatore", storePaymentTestingApi);
exports.default = router;
