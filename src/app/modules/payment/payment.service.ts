import { join } from "path";
import orderModel from "../order/order.model";
import { verifyPayment } from "./payment.utils";
import { readFileSync } from "fs";

const confirmationService = async (transactionId: string, status: string) => {
  const verifyResponse = await verifyPayment(transactionId, status);
  let result;
  let message = "";
  let statusClass = "";
  let redirectStatus = "";

  if (verifyResponse && verifyResponse.request_id === "success") {
    result = await orderModel.findOneAndUpdate(
      { transactionId },
      { paymentStatus: "Paid" }
    );
    message = "Your payment has been successfully completed";
    statusClass = "success";
    redirectStatus = "success";
  } else {
    message = "Your payment has failed";
    statusClass = "failed";
    redirectStatus = "failed";
  }

  const filePath = join(__dirname, "../../views/confirmation.html");
  let template = readFileSync(filePath, "utf-8");
  template = template
    .replace("{{message}}", message)
    .replace("{{status}}", redirectStatus)
    .replace("{{statusClass}}", statusClass);

  return template;
};

export const paymentService = {
  confirmationService,
};
