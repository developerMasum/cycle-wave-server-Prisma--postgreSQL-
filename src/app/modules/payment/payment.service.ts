import prisma from "../../../shared/prisma";

const verifyPayment = async (orderId: string) => {
  const updatedOrder = await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      paymentStatus: "PAID",
    },
  });

  return updatedOrder;
};

export const paymentService = {
  verifyPayment,
};
