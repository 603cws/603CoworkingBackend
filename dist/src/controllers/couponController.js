"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCouponCode = exports.createCoupon = void 0;
const coupon_model_1 = require("./../models/coupon.model");
const createCoupon = async (req, res) => {
    const { code, discount, expiryDate, usageLimit } = req.body;
    try {
        const newCoupon = new coupon_model_1.Coupon({ code, discount, expiryDate, usageLimit });
        const couponCreated = await newCoupon.save();
        res.status(200).json({
            message: 'success',
            couponCreated,
        });
    }
    catch (error) {
        res.status(400).json({
            message: 'something went wrong ,coupon not created',
        });
    }
};
exports.createCoupon = createCoupon;
//req body for creating a discount code
// {
//     "code": "DISCOUNT10",
//     "discount": 10,
//     "expiryDate": "2024-12-31T23:59:59Z",
//     "usageLimit": 100
//   }
const getISTDate = () => {
    // Get the current UTC time
    const now = new Date();
    // IST offset is UTC+5:30 (19800000 milliseconds)
    const istOffset = 5.5 * 60 * 60 * 1000;
    // Adjust the UTC time to IST
    const istTime = new Date(now.getTime() + istOffset);
    // Format as ISO string without the "Z"
    return istTime.toISOString().replace('Z', '');
};
const validateCouponCode = async (req, res) => {
    const { code } = req.body;
    let couponLimit;
    try {
        const getCoupon = await coupon_model_1.Coupon.findOne({ code: code });
        console.log(getCoupon);
        if (!getCoupon) {
            return res.status(400).json('invalid coupon code or coupon not found');
        }
        //if coupon exist
        if (getCoupon) {
            //decrease the limit by 1
            couponLimit = getCoupon?.usageLimit - 1;
            //check if coupon is expired or not
            if (getCoupon.expiryDate < new Date() || getCoupon.usageLimit <= 0) {
                return res.status(400).json({ error: 'Coupon expired' });
            }
            await coupon_model_1.Coupon.findByIdAndUpdate(getCoupon._id, {
                usageLimit: couponLimit,
            }, { new: true, runValidators: true });
            res.status(200).json(getCoupon);
        }
    }
    catch (error) {
        res.status(400).json({
            message: 'something went wrong',
        });
    }
};
exports.validateCouponCode = validateCouponCode;
