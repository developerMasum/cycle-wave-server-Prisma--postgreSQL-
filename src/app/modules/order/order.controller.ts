import { orderFilterableFields } from "./order.utils";
import { Request, Response } from "express";
import { orderService } from "./order.service";

import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import pick from "../../../shared/pick";
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
const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, orderFilterableFields);
  const options = pick(req.query, ["limit", "page", "sort", "priceRange"]);
  const result = await orderService.getAllOrders(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Orders retrieved successfully",
    data: result,
  });
});
const getMyOrders = catchAsync(async (req, res) => {
  const { email } = req.params;
  // console.log(user);

  const result = await orderService.getMyOrders(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My order is retrieved successfully",
    data: result,
  });
});
const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const result = await orderService.getOrderById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order retrieved successfully",
    data: result,
  });
});
export const OrderController = {
  createOrderController,
  getAllOrders,
  getMyOrders,
  getOrderById,
};
