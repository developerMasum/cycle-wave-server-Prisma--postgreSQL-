import axios from "axios";

const store_id = "dhaka686f5bcb36e38";
const store_passwd = "dhaka686f5bcb36e38@ssl";
const is_live = false;
const SSLCommerzPayment = require("sslcommerz-lts");
export const initiatePayment = async (PaymentData: {
  id: string;
  totalPrice: number;
  transactionId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}) => {
  const data = {
    store_id,
    store_passwd,
    total_amount: PaymentData.totalPrice,
    currency: "BDT",
    tran_id: PaymentData.transactionId,
    success_url: `http://localhost:5000/api/v1/payment/success/${PaymentData.id}`,
    fail_url: `http://localhost:5000/api/payment/fail/${PaymentData.id}`,
    cancel_url: `http://localhost:5000/api/payment/cancel/${PaymentData.id}`,
    ipn_url: `http://localhost:5000/api/payment/ipn`,
    shipping_method: "Courier",
    product_name: "E-commerce Order",
    product_category: "Mixed",
    product_profile: "general",
    cus_name: PaymentData.name,
    cus_email: PaymentData.email,
    cus_add1: PaymentData.address,
    cus_add2: "",
    cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: "1207",
    cus_country: "Bangladesh",
    cus_phone: PaymentData.phone,
    cus_fax: "",
    ship_name: PaymentData.name,
    ship_add1: PaymentData.address,
    ship_add2: "",
    ship_city: "Dhaka",
    ship_state: "Dhaka",
    ship_postcode: "1207",
    ship_country: "Bangladesh",
  };

  console.log("sssl Datas", data);

  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

  const apiResponse = await sslcz.init(data);
  const GatewayPageURL = apiResponse.GatewayPageURL;

  if (!GatewayPageURL) throw new Error("Failed to get payment URL");

  return {
    url: GatewayPageURL,
  };
};
