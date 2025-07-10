import { Router } from "express";
import { paymentController } from "./payment.controller";

const router = Router();
router.post("/success/:orderId", paymentController.confirmationController);
export const paymentRoutes = router;
