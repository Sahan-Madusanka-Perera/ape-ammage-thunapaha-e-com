-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('NEW', 'CONFIRMED', 'DISPATCHED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('COD', 'BANK_TRANSFER', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'SLIP_UPLOADED', 'PAID');

-- CreateEnum
CREATE TYPE "Motif" AS ENUM ('CURRY', 'CHILLI', 'FLAKES', 'TURMERIC', 'PEPPER', 'SEED', 'CINNAMON', 'POD', 'LEAF', 'FRUIT');

-- CreateEnum
CREATE TYPE "UploadKind" AS ENUM ('PRODUCT', 'SLIP', 'PORTRAIT');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameSi" TEXT NOT NULL,
    "blurbEn" TEXT NOT NULL DEFAULT '',
    "blurbSi" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameSi" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL DEFAULT '',
    "descriptionSi" TEXT NOT NULL DEFAULT '',
    "pigment" TEXT NOT NULL,
    "motif" "Motif" NOT NULL,
    "categoryId" TEXT NOT NULL,
    "imageId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Variant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "grams" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "inStock" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "publicToken" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'NEW',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "addressLine" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "notes" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "subtotal" INTEGER NOT NULL,
    "deliveryFee" INTEGER NOT NULL,
    "codFee" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    "totalGrams" INTEGER NOT NULL,
    "slipId" TEXT,
    "trackingNumber" TEXT,
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,
    "nameEn" TEXT NOT NULL,
    "nameSi" TEXT NOT NULL,
    "grams" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "lineTotal" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderEvent" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "OrderStatus",
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "whatsappNumber" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "addressEn" TEXT NOT NULL,
    "addressSi" TEXT NOT NULL,
    "announcementEn" TEXT NOT NULL DEFAULT '',
    "announcementSi" TEXT NOT NULL DEFAULT '',
    "deliveryBaseFee" INTEGER NOT NULL,
    "deliveryPerExtraKg" INTEGER NOT NULL,
    "freeDeliveryOver" INTEGER,
    "codEnabled" BOOLEAN NOT NULL DEFAULT true,
    "codFee" INTEGER NOT NULL DEFAULT 0,
    "bankEnabled" BOOLEAN NOT NULL DEFAULT true,
    "bankName" TEXT NOT NULL DEFAULT '',
    "bankBranch" TEXT NOT NULL DEFAULT '',
    "bankAccountName" TEXT NOT NULL DEFAULT '',
    "bankAccountNumber" TEXT NOT NULL DEFAULT '',
    "whatsappOrderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "portraitId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistrictFee" (
    "district" TEXT NOT NULL,
    "baseFee" INTEGER NOT NULL,
    "perExtraKg" INTEGER NOT NULL,

    CONSTRAINT "DistrictFee_pkey" PRIMARY KEY ("district")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Upload" (
    "id" TEXT NOT NULL,
    "kind" "UploadKind" NOT NULL,
    "mime" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "size" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Upload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_categoryId_sortOrder_idx" ON "Product"("categoryId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_productId_grams_key" ON "Variant"("productId", "grams");

-- CreateIndex
CREATE UNIQUE INDEX "Order_number_key" ON "Order"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Order_publicToken_key" ON "Order"("publicToken");

-- CreateIndex
CREATE UNIQUE INDEX "Order_slipId_key" ON "Order"("slipId");

-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Order_phone_idx" ON "Order"("phone");

-- CreateIndex
CREATE INDEX "OrderEvent_orderId_createdAt_idx" ON "OrderEvent"("orderId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Upload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_slipId_fkey" FOREIGN KEY ("slipId") REFERENCES "Upload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderEvent" ADD CONSTRAINT "OrderEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_portraitId_fkey" FOREIGN KEY ("portraitId") REFERENCES "Upload"("id") ON DELETE SET NULL ON UPDATE CASCADE;
