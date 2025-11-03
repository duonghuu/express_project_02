import { responsysController } from "@controllers/responsysController";
import { Router } from "express";

const router = Router();

router.post("/responsys/register", responsysController.handleRegister);
router.post("/responsys/signup_s2s", responsysController.handleSignupS2S);
router.post("/responsys/trigger_s2s", responsysController.handleTriggerS2S);

export default router;