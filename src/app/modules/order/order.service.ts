import { PaymentMethod } from "@prisma/client";
import prisma from "../../../shared/prisma";
import initiatePayment from "../payment/payment.utils";

// Type for incoming order data
interface OrderInput {
  name: string;
  email: string;
  contact: string;
  address: string;
  userId: string;
  deliveryCharge: number;
  paymentMethod: PaymentMethod; // ✅ Use the enum type from Prisma
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
    paymentMethod,
    products,
    deliveryCharge,
    userId,
  } = orderData;

  // 1️⃣ Recalculate total price
  let totalPrice = 0;

  const productItems = await Promise.all(
    products.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.product },
      });
      if (!product) throw new Error(`Product ${item.product} not found`);

      const itemTotal = product.price * item.quantity;
      totalPrice += itemTotal;

      return {
        productId: product.id,
        quantity: item.quantity,
        name: product.name || "",
      };
    })
  );

  // 2️⃣ Create order with nested ProductOrder
  const transactionId = `TXN-${Date.now()}`;

  const newOrder = await prisma.order.create({
    data: {
      name,
      email,
      contact,
      address,
      userId,
      paymentMethod, // ✅ already matches enum
      transactionId,
      deliveryCharge,
      totalPrice,
      status: "PENDING",
      paymentStatus: "PENDING",
      products: {
        create: productItems.map((item) => ({
          product: { connect: { id: item.productId } },
          quantity: item.quantity,
          name: item.name,
        })),
      },
    },
    include: {
      products: true,
    },
  });

  // 3️⃣ Return immediately for COD
  if (paymentMethod === PaymentMethod.CASH_ON_DELIVERY) {
    return newOrder;
  }

  // 4️⃣ Otherwise, initiate online payment
  const paymentSession = await initiatePayment({
    _id: newOrder.id,
    totalPrice,
    transactionId,
    name,
    email,
    phone: contact,
    address,
  });

  return paymentSession;
};

export const orderService = {
  createOrder,
};
