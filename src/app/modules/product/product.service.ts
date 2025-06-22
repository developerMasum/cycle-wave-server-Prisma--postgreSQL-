import { Prisma } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { productSearchableFields } from "./product.utils";
const createProduct = async (data: any) => {
  return await prisma.product.create({ data });
};
const getAllProductsFromDB = async (query: Record<string, unknown>) => {
  const allowedSortFields = ["price", "name", "createdAt"];
  let sortBy = (query.sort as string) || "-createdAt";

  // Fix sort
  let orderByField = "createdAt";
  let order: "asc" | "desc" = "desc";
  if (sortBy.startsWith("-")) {
    const field = sortBy.slice(1);
    if (allowedSortFields.includes(field)) {
      orderByField = field;
      order = "desc";
    }
  } else {
    if (allowedSortFields.includes(sortBy)) {
      orderByField = sortBy;
      order = "asc";
    }
  }

  const orderBy = {
    [orderByField]: order,
  } as Prisma.ProductOrderByWithRelationInput;

  // Price range
  const priceRange = query.priceRange as string;
  const priceFilter: Record<string, number> = {};
  if (priceRange) {
    const [min, max] = priceRange.split("-").map(Number);
    if (!isNaN(min)) priceFilter.gte = min;
    if (!isNaN(max)) priceFilter.lte = max;
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filterFields = ["sort", "priceRange", "page", "limit", "searchTerm"];
  const rawFilters: Record<string, unknown> = {};
  for (const key in query) {
    if (!filterFields.includes(key)) {
      rawFilters[key] = query[key];
    }
  }

  const where: Prisma.ProductWhereInput = {
    ...rawFilters,
  };

  if (Object.keys(priceFilter).length) {
    where.price = priceFilter;
  }

  const searchTerm = query.searchTerm as string;
  if (searchTerm) {
    where.OR = productSearchableFields.map((field) => ({
      [field]: {
        contains: searchTerm,
        mode: "insensitive",
      },
    }));
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
    },
    result: products,
  };
};
const getProductById = async (id: string) => {
  return await prisma.product.findUniqueOrThrow({
    where: {
      id,
    },
  });
};
const deleteProduct = async (id: string) => {
  return await prisma.product.delete({
    where: {
      id,
    },
  });
};
export const productsService = {
  getAllProductsFromDB,
  getProductById,
  createProduct,
  deleteProduct,
};
