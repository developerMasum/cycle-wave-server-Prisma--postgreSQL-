

export type TProduct = {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  wheelSize: number;
  frameMaterial: string;
  quantity: number;
  images: string[];
  specifications: any[]; 
  description: string;
  isDeleted?: boolean;
  totalQuantitySold: number;
  totalRevenue: number;
};
