import { Request, Response } from "express";
import { orderService } from "./order.service";

import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
const createOrderController = async (req: Request, res: Response) => {
  try {
    const orderData = req.body;

    const result = await orderService.createOrder(orderData);

    res.status(201).json({
      success: true,
      message:
        orderData.paymentMethod === "Cash On Delivery"
          ? "Order placed successfully with Cash on Delivery."
          : "Payment session created successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error creating order:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create order.",
      error: (error as Error).message,
    });
  }
};

export const OrderController = {
  createOrderController,
};
