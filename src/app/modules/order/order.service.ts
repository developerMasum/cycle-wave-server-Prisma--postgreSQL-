import { PaymentMethod, Prisma } from "@prisma/client";
import prisma from "../../../shared/prisma";

import { jwtHelpers } from "../../../Helpers/jwtHealpers";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import { paginationHelper } from "../../../Helpers/paginationHelpers";
import { IPaginationOptions } from "../../Interfaces/IPaginationOptions";
import { orderFilterableFields, orderSearchAbleFields } from "./order.utils";
import { initiatePayment } from "../payment/payment.utils";

// Type for incoming order data
interface OrderInput {
  id: string;
  name: string;
  email: string;
  contact: string;
  address: string;
  userId?: string;
  deliveryCharge: number;
  paymentMethod: string; // incoming value: "Cash On Delivery" or "Online Payment"
  products: Array<{
    product: string;
    quantity: number;
    name?: string;
  }>;
}

// Helper function to map incoming string to Prisma enum
const mapPaymentMethod = (method: string): PaymentMethod => {
  switch (method.toLowerCase()) {
    case "cash on delivery":
      return PaymentMethod.CASH_ON_DELIVERY;
    case "online payment":
      return PaymentMethod.ONLINE_PAYMENT;
    default:
      throw new Error("Invalid payment method");
  }
};

interface OrderInput {
  name: string;
  email: string;
  contact: string;
  address: string;
  id: string; // ✅ rename `id` to `userId` here
  deliveryCharge: number;
  paymentMethod: string;
  products: Array<{
    product: string;
    quantity: number;
    name?: string;
  }>;
}

const createOrder = async (orderData: OrderInput) => {
  const {
    name,
    email,
    contact,
    address,
    userId,
    deliveryCharge,
    paymentMethod,
    products,
  } = orderData;

  if (!userId || !deliveryCharge) {
    throw new Error("Missing required fields: userId or deliveryCharge");
  }

  let totalPrice = 0;

  const productItems = await Promise.all(
    products.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.product },
      });
      if (!product) throw new Error(`Product ${item.product} not found`);

      totalPrice += product.price * item.quantity;

      return {
        productId: product.id,
        quantity: item.quantity,
        name: product.name || "",
      };
    })
  );

  const transactionId = `TXN-${Date.now()}`;

  const newOrder = await prisma.order.create({
    data: {
      name,
      email,
      contact,
      address,
      transactionId,
      user: {
        connect: {
          id: userId, // ✅ now properly passed
        },
      },
      paymentMethod: mapPaymentMethod(paymentMethod),
      deliveryCharge,
      totalPrice,
      status: "PENDING",
      paymentStatus: "PENDING",
      products: {
        create: productItems.map((item) => ({
          product: {
            connect: { id: item.productId },
          },
          quantity: item.quantity,
          name: item.name,
        })),
      },
    },
    include: {
      products: true,
    },
  });

  if (mapPaymentMethod(paymentMethod) === PaymentMethod.CASH_ON_DELIVERY) {
    return newOrder;
  }

  const paymentSession = await initiatePayment({
    id: newOrder.id,
    totalPrice,
    transactionId,
    name,
    email,
    phone: contact,
    address,
  });

  return paymentSession;
};

const getAllOrders = async (filters: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, sort } = filters;

  const andConditions: Prisma.OrderWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: orderSearchAbleFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // Exclude `searchTerm` from filter loop
  for (const field of orderFilterableFields) {
    if (field !== "searchTerm" && filters[field]) {
      andConditions.push({
        [field]: {
          equals: filters[field],
        },
      });
    }
  }

  const whereConditions: Prisma.OrderWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  let sortBy = "createdAt";
  let sortOrder: "asc" | "desc" = "desc";

  if (typeof sort === "string") {
    if (sort.startsWith("-")) {
      sortBy = sort.slice(1);
      sortOrder = "desc";
    } else {
      sortBy = sort;
      sortOrder = "asc";
    }
  }

  const data = await prisma.order.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    select: {
      id: true,
      name: true,
      contact: true,
      address: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
      totalPrice: true,
      deliveryCharge: true,
      transactionId: true,
      createdAt: true,
    },
  });

  const total = await prisma.order.count({ where: whereConditions });

  return {
    meta: { page, limit, total },
    data: data,
  };
};

const getMyOrdersData = async (token: string) => {
  console.log("Token:", token);
  try {
    // Verify the token and extract the user ID
    const verifiedUser = jwtHelpers.verifyToken(
      token,
      config.jwt.jwt_secret as Secret
    );
    console.log("Verified User:", verifiedUser);

    const userId = verifiedUser?.id;
    console.log("User ID:", userId);

    // Fetch the user profile and update it
    const result = await prisma.order.findMany({
      where: {
        userId: userId,
      },
      include: {
        products: true,
      },
    });

    return result;
  } catch (error: any) {
    console.error("Error updating user profile:", error.message || error);
    throw new Error("Error updating user profile");
  }
};

const getOrderById = async (id: string) => {
  const result = await prisma.order.findUnique({
    where: {
      id: id,
    },
  });
  return result;
};
const updateOrderStatus = async (id: string, data: any) => {
  const result = await prisma.order.update({
    where: {
      id: id,
    },
    data: {
      status: data.status,
    },
  });
  return result;
};
const deleteOrder = async (id: string) => {
  await prisma.orderedproductDetails.deleteMany({
    where: { orderId: id },
  });

  const result = await prisma.order.delete({
    where: { id },
  });

  return result;
};

export const orderService = {
  createOrder,
  getAllOrders,
  getMyOrdersData,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};
