"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthControllers_1 = require("../controllers/AuthControllers");
const router = (0, express_1.Router)();
router.post("/login", AuthControllers_1.login);
router.post("/admin/login", AuthControllers_1.adminlogin);
router.post("/logout", AuthControllers_1.logout);
exports.default = router;
