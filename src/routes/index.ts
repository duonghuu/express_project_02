import { homeController } from "@controllers/homeController";
import { Router } from "express";

const router = Router();

router.get("/", homeController.handleHomePage);

export default router;