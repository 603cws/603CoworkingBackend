import { Router } from "express";
import { adminlogin, login, logout } from "../controllers/AuthControllers";

const router = Router()

router.post("/login", login);
router.post("/admin/login", adminlogin);
router.post("/logout", logout);

export default router