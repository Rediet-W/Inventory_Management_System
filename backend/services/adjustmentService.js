import Adjustment from "../models/adjustmentModel.js";
import Product from "../models/productModel.js";
import Sale from "../models/saleModel.js";
import Purchase from "../models/purchaseModel.js";
import Shop from "../models/shopModel.js";
import { Op } from "sequelize";

export const processAdjustment = async (id, approver) => {
  const adjustment = await Adjustment.findByPk(id);
  if (!adjustment || adjustment.status !== "pending")
    return { error: "Invalid adjustment" };

  const { type, batchNumber, quantity, oldQuantity } = adjustment;
  const product = await Product.findOne({ where: { batchNumber } });

  if (!product) return { error: "Product not found" };

  if (type === "sale") {
    const shopProduct = await Shop.findOne({ where: { batchNumber } });
    if (!shopProduct || shopProduct.quantity < quantity) {
      return { error: "Not enough stock to reverse the sale" };
    }
    // 1. Reverse the old sale
    await Sale.create({
      name: shopProduct.name,
      batchNumber,
      unitOfMeasurement: shopProduct.unitOfMeasurement,
      quantity: -oldQuantity,
      unitSellingPrice: shopProduct.sellingPrice,
      seller: adjustment.requestedBy,
      averageCost: product.averageCost,
    });
    // 2. Apply the new sale
    await Sale.create({
      name: shopProduct.name,
      batchNumber,
      unitOfMeasurement: shopProduct.unitOfMeasurement,
      quantity: quantity,
      unitSellingPrice: shopProduct.sellingPrice,
      seller: adjustment.requestedBy,
      averageCost: product.averageCost,
    });
    // Update the shop product quantity
    if (oldQuantity > quantity) {
      shopProduct.quantity += oldQuantity - quantity;
    }
    await shopProduct.save();
  } else if (type === "purchase") {
    await Purchase.create({
      name: product.name,
      batchNumber,
      unitOfMeasurement: product.unitOfMeasurement,
      quantity: -oldQuantity,
      unitCost: product.averageCost,
      averageCost: product.averageCost,
      purchaser: adjustment.requestedBy,
      reference: "Adjustment",
      totalCost: -oldQuantity * product.averageCost,
    });

    await Purchase.create({
      name: product.name,
      batchNumber,
      unitOfMeasurement: product.unitOfMeasurement,
      quantity: quantity,
      unitCost: product.averageCost,
      averageCost: product.averageCost,
      purchaser: adjustment.requestedBy,
      reference: "Adjustment",
      totalCost: quantity * product.averageCost,
    });

    product.quantity = quantity;

    product.totalCost = product.quantity * product.averageCost;
    await product.save();
  }

  adjustment.status = "approved";
  adjustment.approvedBy = approver;
  await adjustment.save();

  return adjustment;
};
