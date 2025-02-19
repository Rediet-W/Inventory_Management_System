import Sale from "../models/saleModel.js";
import Shop from "../models/shopModel.js";
import { Op } from "sequelize";

export const getSalesByDateRange = async (startDate, endDate) => {
  return await Sale.findAll({
    where: {
      sale_date: {
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
      sale_date: {
        [Op.between]: [
          new Date(date).setHours(0, 0, 0, 0),
          new Date(date).setHours(23, 59, 59, 999),
        ],
      },
    },
  });
};

export const createSale = async (data) => {
  const shopProduct = await Shop.findByPk(data.product_id);
  if (!shopProduct) return { error: "Shop product not found" };

  if (data.quantity_sold > shopProduct.quantity) {
    return {
      error: `Not enough stock available. Only ${shopProduct.quantity} units in stock.`,
    };
  }

  const saleData = {
    product_id: shopProduct.id,
    product_name: shopProduct.product_name,
    batch_number: shopProduct.batch_number,
    quantity_sold: data.quantity_sold,
    selling_price: shopProduct.selling_price,
    user_name: data.user_name,
    sale_date: new Date(),
  };

  const sale = await Sale.create(saleData);

  const newQuantity = shopProduct.quantity - data.quantity_sold;
  if (newQuantity === 0) {
    await shopProduct.destroy();
  } else {
    shopProduct.quantity = newQuantity;
    await shopProduct.save();
  }

  return sale;
};

export const updateSale = async (id, quantitySold) => {
  const sale = await Sale.findByPk(id);
  if (!sale) return null;

  const shopProduct = await Shop.findByPk(sale.product_id);
  if (!shopProduct) return null;

  const quantityDifference = quantitySold - sale.quantity_sold;

  if (quantityDifference < 0) {
    shopProduct.quantity += Math.abs(quantityDifference);
  } else if (quantityDifference > 0) {
    if (shopProduct.quantity < quantityDifference) {
      return {
        error: `Not enough stock available to increase the sale. Only ${shopProduct.quantity} units in stock.`,
      };
    }
    shopProduct.quantity -= quantityDifference;
  }

  await shopProduct.save();
  sale.quantity_sold = quantitySold;
  await sale.save();

  return sale;
};

export const deleteSale = async (id) => {
  const sale = await Sale.findByPk(id);
  if (!sale) return null;

  await sale.destroy();
  return { message: "Sale deleted successfully" };
};

export const getAllSales = async () => {
  return await Sale.findAll();
};
