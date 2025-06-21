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
    const result = await prisma.$transaction(async (tx) => {
      // Create user first
      const createdUser = await tx.user.create({
        data: {
          name: userData.name,
          age: userData.age,
          phone: userData.phone,
          email: userData.email,
          password: hashedPassword,
          profilePhoto: userData.profilePhoto,
          plan: userData.plan,
          role: userData.role,
        },
      });

      // Create user profile associated with the user
      const createdProfile = await tx.userProfile.create({
        data: {
          userId: createdUser.id,
          location: userData.location,
          occupation: userData.occupation,
          about: userData.about,
          height: userData.height,
          weight: userData.weight,
          photo: userData.profilePhoto,
          maritalStatus: userData.maritalStatus,
          gender: userData.gender,
        },
      });

      // Exclude password and role from the returned object
      const { password, role, ...userWithoutPasswordAndRole } = createdUser;

      return {
        data: { user: userWithoutPasswordAndRole, profile: createdProfile },
      };
    });

    return result;
  } catch (error) {
    // Handle any errors that occur during the transaction
    console.error("Error creating user:", error);
    throw new Error("Failed to create user.");
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
      phone: true,
      email: true,
      age: true,
      profilePhoto: true,
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

const getMyself = async (token: string) => {
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
      include: {
        userProfile: true,
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
    // Verify the token and extract the user ID
    const verifiedUser = jwtHelpers.verifyToken(
      token,
      config.jwt.jwt_secret as Secret
    );
    // console.log("Verified User:", verifiedUser);

    const userId = verifiedUser.id;
    // console.log("User ID:", userId);

    // Fetch the user profile and update it
    const result = await prisma.userProfile.update({
      where: {
        userId: userId,
      },
      data: {
        ...data,
      },
    });

    return result;
  } catch (error: any) {
    console.error("Error updating user profile:", error.message || error);
    throw new Error("Error updating user profile");
  }
};

export const userService = {
  createUserIntoDB,
  deleteUser,
  getAllUser,
  getMyself,
  updateMyself,
};
