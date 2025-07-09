import { Prisma, PrismaClient, User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { IPaginationOptions } from "../../Interfaces/IPaginationOptions";
import { paginationHelper } from "../../../Helpers/paginationHelpers";

import { jwtHelpers } from "../../../Helpers/jwtHealpers";
import config from "../../../config";
import { Secret } from "jsonwebtoken";
import prisma from "../../../shared/prisma";
import { userSearchAbleFields } from "./user.constants";

const createUserIntoDB = async (userData: any) => {
  const hashedPassword: string = await bcrypt.hash(userData.password, 12);

  try {
    const result = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });
    return result;
  } catch (error) {
    throw error;
  }
};

const getAllUser = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];

  //console.log(filterData);
  if (params.searchTerm) {
    andConditions.push({
      OR: userSearchAbleFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.user.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      contactNumber: true,
      isBlock: true,
      isDeleted: true,

      createdAt: true,
      updatedAt: true,
    },
  });

  const total = await prisma.user.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const deleteUser = async (id: any) => {
  const result = await prisma.user.delete({
    where: {
      id,
    },
  });
  return result;
};

const getMe = async (token: string) => {
  console.log("Token:", token);
  try {
    // Verify the token and extract the user ID
    const verifiedUser = jwtHelpers.verifyToken(
      token,
      config.jwt.jwt_secret as Secret
    );
    console.log("Verified User:", verifiedUser);

    const userId = verifiedUser.id;
    console.log("User ID:", userId);

    // Fetch the user with profile included
    const result = await prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });

    console.log("Fetched user with profile:", result);
    return result;
  } catch (error) {
    console.error("Error fetching user or profile:", error);
    throw new Error("User or Profile not found");
  }
};
const updateMyself = async (token: string, data: any) => {
  console.log("Data:", data);
  try {
    const verifiedUser = jwtHelpers.verifyToken(
      token,
      config.jwt.jwt_secret as Secret
    );
    console.log("Verified User:", verifiedUser);

    const userId = verifiedUser.id;

    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) throw new Error("User not found");

    const result = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...data,
      },
    });

    return result;
  } catch (error: any) {
    console.error("Full Error Stack:", error);
    throw new Error(error.message || "Error updating user profile");
  }
};
const userBlockUnblock = async (id: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
  });

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      isBlock: !user.isBlock,
    },
  });

  return updatedUser;
};

export const userService = {
  createUserIntoDB,
  // deleteUser,
  getAllUser,
  getMe,
  updateMyself,
  userBlockUnblock,
};
