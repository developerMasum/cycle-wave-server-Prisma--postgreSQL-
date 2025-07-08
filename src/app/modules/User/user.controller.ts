import { Request, Response } from "express";

import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { userService } from "./user.service";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import { userFilterableFields } from "./user.constants";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createUserIntoDB(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User Profile Created successful!",
    data: result,
  });
});

const getAllUser = catchAsync(async (req: Request, res: Response) => {
  // console.log(req.query)
  const filters = pick(req.query, userFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await userService.getAllUser(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "  Users retrieved  successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const authorization: string = req.headers.authorization || "";
  console.log(authorization);
  const result = await userService.getMe(authorization);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My own retrieved successfully!",
    data: result,
  });
});
const updateMyself = catchAsync(async (req: Request, res: Response) => {
  const authorization: string = req.headers.authorization || "";
  const result = await userService.updateMyself(authorization, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My own updated successfully!",
    data: result,
  });
});

export const userController = {
  createUser,
  getAllUser,
  getMe,
  updateMyself,
};
