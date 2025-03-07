import Shop from "../models/shopModel.js";
import { Op } from "sequelize";

export const getShopProducts = async (start, end) => {
  const whereClause = {};
  if (start && end) {
    whereClause.createdAt = {
      [Op.between]: [
        new Date(start).setHours(0, 0, 0, 0),
        new Date(end).setHours(23, 59, 59, 999),
      ],
    };
  }
  return await Shop.findAll({ where: whereClause });
};

export const getProductByBatchNumber = async (batchNumber) => {
  return await Shop.findOne({ where: { batchNumber } });
};

export const getProductsByName = async (name) => {
  return await Shop.findAll({
    where: {
      name: { [Op.like]: `%${name}%` },
    },
  });
};

export const addProductToShop = async (data) => {
  return await Shop.create({
    name: data.name,
    batchNumber: data.batchNumber,
    unitOfMeasurement: data.unitOfMeasurement,
    quantity: data.quantity,
    sellingPrice: data.sellingPrice,
  });
};

export const updateProductInShop = async (id, data) => {
  const shopProduct = await Shop.findByPk(id);
  if (!shopProduct) return null;

  shopProduct.name = data.name || shopProduct.name;
  shopProduct.batchNumber = data.batchNumber || shopProduct.batchNumber;
  shopProduct.unitOfMeasurement =
    data.unitOfMeasurement || shopProduct.unitOfMeasurement;
  shopProduct.quantity = data.quantity || shopProduct.quantity;
  shopProduct.sellingPrice = data.sellingPrice || shopProduct.sellingPrice;

  if (shopProduct.quantity === 0) {
    await shopProduct.destroy();
    return { message: "Product deleted as quantity is 0" };
  } else {
    await shopProduct.save();
    return shopProduct;
  }
};

export const deleteProductFromShop = async (id) => {
  const shopProduct = await Shop.findByPk(id);
  if (!shopProduct) return null;

  await shopProduct.destroy();
  return { message: "Product removed from shop" };
};
