import { TProduct } from "./product.interface";

const productSchema = new Schema<TProduct>(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    wheelSize: { type: Number, required: true },
    category: { type: String, required: true },
    frameMaterial: { type: String, required: true },
    totalQuantitySold: { type: Number, required: false },
    totalRevenue: { type: Number, required: false },
    quantity: { type: Number, required: true },
    images: [{ type: String }],
    specifications: [
      {
        key: String,
        value: String,
      },
    ],
  },
  { timestamps: true }
);

const Product = model<TProduct>("Product", productSchema);
export default Product;
