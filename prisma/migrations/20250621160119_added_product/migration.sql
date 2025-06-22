-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "wheelSize" TEXT NOT NULL,
    "frameMaterial" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "images" TEXT[],
    "specifications" JSONB NOT NULL,
    "description" TEXT NOT NULL,
    "isDeleted" BOOLEAN,
    "totalQuantitySold" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
