import Sale from "../models/saleModel.js";
import Shop from "../models/shopModel.js";
import { Op } from "sequelize";

export const getSalesByDateRange = async (startDate, endDate) => {
  return await Sale.findAll({
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

export const getSalesByDate = async (date) => {
  return await Sale.findAll({
    where: {
      createdAt: {
        [Op.between]: [
          new Date(date).setHours(0, 0, 0, 0),
          new Date(date).setHours(23, 59, 59, 999),
        ],
      },
    },
  });
};

export const getSalesByBatchNumber = async (batchNumber) => {
  return await Sale.findAll({ where: { batchNumber } });
};

export const createSale = async (data) => {
  const shopProduct = await Shop.findOne({
    where: { batchNumber: data.batchNumber },
  });

  if (!shopProduct) return { error: "Shop product not found" };

  if (data.quantity > shopProduct.quantity) {
    return {
      error: `Not enough stock available. Only ${shopProduct.quantity} units in stock.`,
    };
  }

  const sale = await Sale.create({
    name: shopProduct.name,
    batchNumber: shopProduct.batchNumber,
    unitOfMeasurement: shopProduct.unitOfMeasurement,
    quantity: data.quantity,
    unitSellingPrice: shopProduct.sellingPrice,
    seller: data.seller,
  });

  shopProduct.quantity -= data.quantity;
  if (shopProduct.quantity === 0) {
    await shopProduct.destroy();
  } else {
    await shopProduct.save();
  }

  return sale;
};

export const updateSale = async (id, newQuantity) => {
  const sale = await Sale.findByPk(id);
  if (!sale) return null;

  const shopProduct = await Shop.findOne({
    where: { batchNumber: sale.batchNumber },
  });
  if (!shopProduct) return null;

  const quantityDifference = newQuantity - sale.quantity;

  if (quantityDifference > 0 && shopProduct.quantity < quantityDifference) {
    return {
      error: `Not enough stock available. Only ${shopProduct.quantity} units left.`,
    };
  }

  shopProduct.quantity -= quantityDifference;
  await shopProduct.save();

  sale.quantity = newQuantity;
  await sale.save();

  return sale;
};

// Delete Sale (No inventory rollback)
export const deleteSale = async (id) => {
  const sale = await Sale.findByPk(id);
  if (!sale) return null;

  await sale.destroy();
  return { message: "Sale deleted successfully" };
};

export const getAllSales = async () => {
  return await Sale.findAll();
};
