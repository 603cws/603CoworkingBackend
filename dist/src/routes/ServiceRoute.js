"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ServiceControlls_1 = require("../controllers/ServiceControlls");
const router = (0, express_1.Router)();
router.post("/sendpartnershipemail", ServiceControlls_1.sendPartnershipEmail);
exports.default = router;
