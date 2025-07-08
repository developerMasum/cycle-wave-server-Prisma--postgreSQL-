import { PaymentMethod } from "@prisma/client";
import prisma from "../../../shared/prisma";
import initiatePayment from "../payment/payment.utils";
import { jwtHelpers } from "../../../Helpers/jwtHealpers";
import { Secret } from "jsonwebtoken";
import config from "../../../config";

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

const getAllOrders = async (filters: any, options: any) => {
  const result = await prisma.order.findMany();
  return result;
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

export const orderService = {
  createOrder,
  getAllOrders,
  getMyOrdersData,
  getOrderById,
};
