import { Router } from "express";
import { createCoupon, validateCouponCode } from "../controllers/couponController";

const router = Router()

router.post("/createcoupon",createCoupon)
router.post("/validatecoupon",validateCouponCode)


export default router