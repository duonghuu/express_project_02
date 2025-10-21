import { homeController } from "@controllers/homeController";
import { responsysController } from "@controllers/responsysController";
import { Router } from "express";

const router = Router();

router.get("/", homeController.handleHomePage);
router.get("/add-product", homeController.handleAddProduct);
router.post("/responsys/register", responsysController.handleRegister);

export default router;