import { Request, Response } from "express";
import { productsService } from "./product.service";

import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import pick from "../../../shared/pick";
import { productFilterableFields } from "./product.utils";
const createProductController = async (req: Request, res: Response) => {
  const result = await productsService.createProduct(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product is created successfully",
    data: result,
  });
};
const getAllProductsHandler = catchAsync(async (req, res) => {
  const filters = pick(req.query, productFilterableFields);
  const options = pick(req.query, ["limit", "page", "sort", "priceRange"]); // note: use 'sort' not 'sortBy'
  const query = { ...filters, ...options };

  const result = await productsService.getAllProductsFromDB(query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Products retrieved successfully",
    meta: result.meta,
    data: result.result,
  });
});

const getProductByIdHandler = async (req: Request, res: Response) => {
  try {
    const product = await productsService.getProductById(req.params.id);
    res.status(200).json({
      success: true,
      message: "Product data retrieved successfully!",
      data: product,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error!",
      error: err,
    });
  }
};
const deleteProduct = catchAsync(async (req, res) => {
  const result = await productsService.deleteProduct(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product is deleted successfully",
    data: result,
  });
});

export const productsController = {
  getProductByIdHandler,
  getAllProductsHandler,
  createProductController,
  deleteProduct,
};
