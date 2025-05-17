import { Router } from "express";
import { sendJobCallBack } from "../controllers/careerControllers";

const router = Router()

router.post("/send", sendJobCallBack);

export default router;