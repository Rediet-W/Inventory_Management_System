import Transfer from "../models/transferModel.js";
import Product from "../models/productModel.js";
import Shop from "../models/shopModel.js";
import { Op } from "sequelize";

export const getAllTransfers = async (startDate, endDate) => {
  const whereClause = {};
  if (startDate && endDate) {
    whereClause.createdAt = {
      [Op.between]: [
        new Date(startDate).setHours(0, 0, 0, 0),
        new Date(endDate).setHours(23, 59, 59, 999),
      ],
    };
  }
  return await Transfer.findAll({ where: whereClause });
};

export const getTransferByBatchNumber = async (batchNumber) => {
  return await Transfer.findAll({ where: { batchNumber } });
};

// Create a transfer record (Move product from store to shop)
export const createTransfer = async (data) => {
  const product = await Product.findOne({
    where: { batchNumber: data.batchNumber },
  });

  console.log(product, "product");
  if (!product) {
    return { error: "Product not found in store" };
  }

  if (data.quantity > product.quantity) {
    return {
      error: `Not enough stock in the store. Only ${product.quantity} units available.`,
    };
  }

  product.quantity -= data.quantity;

  await product.save();

  const shopProduct = await Shop.findOne({
    where: { batchNumber: data.batchNumber },
  });
  console.log(shopProduct, "shopProduct");
  if (shopProduct) {
    shopProduct.quantity += data.quantity;
    await shopProduct.save();
  } else {
    await Shop.create({
      name: data.name,
      batchNumber: data.batchNumber,
      unitOfMeasurement: data.unitOfMeasurement,
      quantity: data.quantity,
      sellingPrice: data.sellingPrice,
      reorderLevel: data.reorderLevel,
    });
  }

  return await Transfer.create({
    name: data.name,
    quantity: data.quantity,
    sellingPrice: data.sellingPrice,
    batchNumber: data.batchNumber,
    unitOfMeasurement: data.unitOfMeasurement,
    reference: data.reference,
    storeKeeper: data.storeKeeper,
  });
};

export const deleteTransfer = async (id) => {
  const transfer = await Transfer.findByPk(id);
  if (!transfer) return null;

  await transfer.destroy();
  return { message: "Transfer deleted successfully" };
};
