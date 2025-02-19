import Product from "../models/productModel.js";
import { Op } from "sequelize";

export const getAllProducts = async () => {
  return await Product.findAll();
};

export const getProductById = async (id) => {
  return await Product.findByPk(id);
};

export const createProduct = async (data) => {
  return await Product.create(data);
};

export const updateProduct = async (id, data) => {
  const product = await Product.findByPk(id);
  if (!product) return null;

  return await product.update(data);
};

export const deleteProduct = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) return null;

  await product.destroy();
  return { message: "Product removed successfully" };
};

export const getProductsByDate = async (startDate, endDate) => {
  const start = new Date(startDate).setHours(0, 0, 0, 0);
  const end = new Date(endDate).setHours(23, 59, 59, 999);

  return await Product.findAll({
    where: {
      createdAt: {
        [Op.between]: [start, end],
      },
    },
  });
};
