import Product from "../models/productModel.js";
import { Op } from "sequelize";
import Shop from "../models/shopModel.js";
import Transfer from "../models/transferModel.js";

export const getAllProducts = async () => {
  return await Product.findAll();
};

export const getProductById = async (id) => {
  return await Product.findByPk(id);
};

export const getProductByBatchNumber = async (batchNumber) => {
  const product = await Product.findOne({
    where: { batchNumber },
  });

  return product;
};

export const createProduct = async (data) => {
  return await Product.create(data);
};

export const updateProduct = async (id, data) => {
  const product = await Product.findByPk(id);
  if (!product) return null;

  // ** Update Product **
  await product.update(data);

  // ** Update Shop if product exists there **
  const shopProduct = await Shop.findOne({
    where: { batchNumber: product.batchNumber },
  });
  if (shopProduct) {
    await shopProduct.update({
      name: data.name || shopProduct.name,
      unitOfMeasurement:
        data.unitOfMeasurement || shopProduct.unitOfMeasurement,
      sellingPrice: data.sellingPrice || shopProduct.sellingPrice,
      reorderLevel: data.reorderLevel || shopProduct.reorderLevel,
    });
  }

  // ** Update Transfers if product exists there **
  const transfers = await Transfer.findAll({
    where: { batchNumber: product.batchNumber },
  });
  if (transfers.length > 0) {
    await Promise.all(
      transfers.map((transfer) =>
        transfer.update({
          name: data.name || transfer.name,
          unitOfMeasurement:
            data.unitOfMeasurement || transfer.unitOfMeasurement,
          sellingPrice: data.sellingPrice || transfer.sellingPrice,
        })
      )
    );
  }

  return product;
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
