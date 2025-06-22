import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const initiatePayment = async (paymentData: any) => {
  const response = await axios.post(process.env.PAYMENT_URL!, {
    store_id: process.env.STORE_ID,
    signature_key: process.env.SIGNATURE_KEY,
    tran_id: paymentData.transactionId,
    cus_name: paymentData.name,
    amount: paymentData.totalPrice,
    cus_email: paymentData.email,
    cus_add1: paymentData.address,
    cus_phone: paymentData.phone,
    success_url: `http://localhost:3000/api/v1/payment/confirmation?transactionId=${paymentData.transactionId}&status=success`,
    fail_url: `http://localhost:3000/api/v1/payment/confirmation?status=failed`,
    cancel_url: "http://localhost:5173",
    currency: "BDT",
    desc: "Merchant Registration Payment",
    cus_add2: "Mohakhali DOHS",
    cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: "1206",
    cus_country: "Bangladesh",
    type: "json",
  });
  // console.log(response.data);
  return response.data;
};

export default initiatePayment;

export const verifyPayment = async (status: string, transactionId: string) => {
  const response = await axios.get(process.env.PAYMENT_VALIDATION_URL!, {
    params: {
      store_id: process.env.STORE_ID,
      signature_key: process.env.SIGNATURE_KEY,
      request_id: transactionId,
      type: "json",
    },
  });
  //console.log(response.data);
  return response.data;
};
