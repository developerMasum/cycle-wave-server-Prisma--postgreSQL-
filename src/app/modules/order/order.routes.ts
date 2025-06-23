import { Router } from "express";
import { OrderController } from "./order.controller";

const router = Router();

// Route to create an order
router.get("/:id", OrderController.getOrderById);
router.post("/checkout", OrderController.createOrderController);
router.get("/", OrderController.getAllOrders);
router.get("/my-orders", OrderController.getMyOrdersData);
// router.patch("/status/:id", OrderController.updateOrderStatus);
// router.delete("/:id", OrderController.deleteOrder);

export const orderRoutes = router;
