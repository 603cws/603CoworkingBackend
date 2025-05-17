"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const careerControllers_1 = require("../controllers/careerControllers");
const router = (0, express_1.Router)();
router.post("/send", careerControllers_1.sendJobCallBack);
exports.default = router;
