import { join } from "path";
import { Request, Response } from "express";
import { paymentService } from "./payment.service";

const confirmationController = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    await paymentService.verifyPayment(orderId);

    // ✅ Send HTML file
    const filePath = join(__dirname, "../../../views/confirmation.html");
    return res.sendFile(filePath);
  } catch (error: any) {
    console.error("Error confirming payment:", error.message);
    return res.status(500).send("Payment verification failed.");
  }
};

export const paymentController = { confirmationController };
