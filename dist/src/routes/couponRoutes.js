"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const couponController_1 = require("../controllers/couponController");
const router = (0, express_1.Router)();
router.post("/createcoupon", couponController_1.createCoupon);
router.post("/validatecoupon", couponController_1.validateCouponCode);
exports.default = router;
