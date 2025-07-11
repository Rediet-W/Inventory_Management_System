import Purchase from "../models/purchaseModel.js";
import Product from "../models/productModel.js";
import { Op } from "sequelize";

export const createPurchase = async (data) => {
  const product = await Product.findOne({
    where: { batchNumber: data.batchNumber },
  });

  let averageCost;

  if (product) {
    const previousTotalCost = Number(product.totalCost);
    const newPurchaseTotalCost = data.quantity * data.unitCost;
    const totalCost = previousTotalCost + newPurchaseTotalCost;

    const totalQuantity = Number(product.quantity) + Number(data.quantity);

    averageCost =
      totalQuantity > 0
        ? Number(totalCost) / Number(totalQuantity)
        : Number(data.unitCost);

    product.quantity = String(totalQuantity);
    product.averageCost = averageCost;
    product.totalCost = product.averageCost * product.quantity;
    product.sellingPrice = averageCost * 1.1;
    await product.save();
  } else {
    averageCost = data.unitCost;
    await Product.create({
      name: data.name,
      batchNumber: data.batchNumber,
      unitOfMeasurement: data.unitOfMeasurement,
      quantity: data.quantity,
      averageCost: averageCost,
      sellingPrice: Math.round(averageCost * 1.1),
      totalCost: data.quantity * data.unitCost,
    });
  }

  return await Purchase.create({
    name: data.name,
    batchNumber: data.batchNumber,
    unitOfMeasurement: data.unitOfMeasurement,
    quantity: data.quantity,
    unitCost: data.unitCost,
    averageCost: averageCost,
    purchaser: data.purchaser,
    reference: data.reference,
    totalCost: data.quantity * data.unitCost,
  });
};

export const getPurchaseByBatchNumber = async (batchNumber) => {
  return await Purchase.findAll({ where: { batchNumber } });
};

export const getAllPurchases = async (startDate, endDate) => {
  const whereClause = {};
  if (startDate && endDate) {
    whereClause.createdAt = {
      [Op.between]: [
        new Date(startDate).setHours(0, 0, 0, 0),
        new Date(endDate).setHours(23, 59, 59, 999),
      ],
    };
  }
  return await Purchase.findAll({ where: whereClause });
};

export const getPurchaseById = async (id) => {
  return await Purchase.findByPk(id);
};

export const deletePurchase = async (id) => {
  const purchase = await Purchase.findByPk(id);
  if (!purchase) return null;

  const product = await Product.findOne({
    where: { batchNumber: purchase.batchNumber },
  });

  if (product) {
    const newQuantity = product.quantity - purchase.quantity;

    if (newQuantity <= 0) {
      await product.destroy(); // Remove product if quantity goes to 0
    } else {
      product.quantity = newQuantity;
      await product.save();
    }
  }

  await purchase.destroy();
  return { message: "Purchase deleted successfully" };
};

export const getPurchaseByDateRange = async (startDate, endDate) => {
  return await Purchase.findAll({
    where: {
      createdAt: {
        [Op.between]: [
          new Date(startDate).setHours(0, 0, 0, 0),
          new Date(endDate).setHours(23, 59, 59, 999),
        ],
      },
    },
  });
};

export const updatePurchase = async (id, data) => {
  const purchase = await Purchase.findByPk(id);
  if (!purchase) return null;

  // Check if the purchase is within the last 10 hours
  const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000);
  if (purchase.createdAt < tenHoursAgo) {
    throw new Error("Edits are only allowed within 10 hours of purchase.");
  }

  // Calculate the new total cost for the updated purchase
  const newPurchaseTotalCost = data.quantity * data.unitCost;

  // Find the associated product
  const product = await Product.findOne({
    where: { batchNumber: purchase.batchNumber },
  });

  if (product) {
    // Reverse the effect of the old purchase
    const oldPurchaseTotalCost = purchase.quantity * purchase.unitCost;
    const newQuantity = product.quantity - purchase.quantity + data.quantity;
    const newTotalCost =
      product.totalCost - oldPurchaseTotalCost + newPurchaseTotalCost;

    // Update the product
    await product.update({
      quantity: newQuantity,
      totalCost: newTotalCost,
      averageCost: newTotalCost / newQuantity,
    });
  }

  // Update the purchase
  await purchase.update(data);

  return purchase;
};
