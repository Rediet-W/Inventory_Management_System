import Shop from "../models/shopModel.js";
import Product from "../models/productModel.js";
import { Op } from "sequelize";

export const getShopProducts = async (start, end) => {
  const whereClause = {};
  if (start && end) {
    whereClause.date_added = {
      [Op.between]: [
        new Date(start).setHours(0, 0, 0, 0),
        new Date(end).setHours(23, 59, 59, 999),
      ],
    };
  }
  return await Shop.findAll({ where: whereClause });
};

export const addProductToShop = async (data) => {
  const product = await Product.findByPk(data.productId);
  if (!product) return { error: "Product not found in the store" };

  if (product.quantity < data.quantity) {
    return { error: "Not enough stock available" };
  }

  product.quantity -= data.quantity;
  if (product.quantity === 0) {
    await product.destroy();
    return {
      message: "Product added to shop and deleted from store as quantity is 0",
    };
  } else {
    await product.save();
  }

  return await Shop.create({
    product_id: data.productId,
    product_name: product.name,
    batch_number: data.batchNumber,
    quantity: data.quantity,
    buying_price: product.buyingPrice,
    selling_price: data.sellingPrice,
    user_name: data.userName,
  });
};

export const updateProductInShop = async (id, data) => {
  const shopProduct = await Shop.findByPk(id);
  if (!shopProduct) return null;

  shopProduct.product_name = data.product_name || shopProduct.product_name;
  shopProduct.batch_number = data.batch_number || shopProduct.batch_number;
  shopProduct.quantity = data.quantity || shopProduct.quantity;
  shopProduct.selling_price = data.selling_price || shopProduct.selling_price;
  shopProduct.user_name = data.user_name || shopProduct.user_name;

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
