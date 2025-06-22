import { Router } from "express";
import { OrderController } from "./order.controller";

const router = Router();

// Route to create an order
// router.get("/:id", OrderController.getOrderByIdController);
router.post("/checkout", OrderController.createOrderController);
// router.get("/my-orders/:id", OrderController.getMyOrders);
// router.get("/", OrderController.getAllOrders);
// router.patch("/status/:id", OrderController.updateOrderStatus);
// router.delete("/:id", OrderController.deleteOrder);

export const orderRoutes = router;
