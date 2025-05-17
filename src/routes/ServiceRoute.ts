import { Router } from "express";
import { sendPartnershipEmail } from "../controllers/ServiceControlls";

const router = Router();

router.post("/sendpartnershipemail", sendPartnershipEmail);

export default router;
