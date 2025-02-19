import Purchase from "../models/purchaseModel.js";
import Product from "../models/productModel.js";
import { Op } from "sequelize";

export const createPurchase = async (data) => {
  const product = await Product.findByPk(data.productId);
  if (!product) return null;

  const purchase = await Purchase.create({
    product_id: data.productId,
    product_name: product.name,
    quantity: data.quantity,
    buying_price: data.buyingPrice,
    purchase_date: data.purchaseDate,
    user_name: data.userName,
  });

  product.quantity += data.quantity;
  await product.save();

  return purchase;
};

export const getAllPurchases = async (startDate, endDate) => {
  const whereClause = {};
  if (startDate && endDate) {
    whereClause.purchase_date = {
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

  const product = await Product.findByPk(purchase.product_id);
  if (product) {
    product.quantity -= purchase.quantity;
    await product.save();
  }

  await purchase.destroy();
  return { message: "Purchase deleted successfully" };
};
