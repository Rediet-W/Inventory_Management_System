import SaleUnit from "../models/salesunitModel.js";
import Product from "../models/productModel.js";
import Shop from "../models/shopModel.js";
import { Op } from "sequelize";
import { updateProduct } from "./productService.js";
import { updateProductInShop } from "./shopService.js";

export const getSaleUnitsByProductId = async (productId) => {
  return await SaleUnit.findAll({ where: { productId } });
};

export const createSaleUnit = async (productId, unitData) => {
  const { name, unitQuantity, sellingPrice, baseUnit } = unitData;

  const product = await Product.findByPk(productId);
  if (!product) throw new Error("Product not found");

  if (baseUnit) {
    const existingBase = await SaleUnit.findOne({
      where: { productId, baseUnit: true },
    });
    if (existingBase) {
      throw new Error(
        "Product already has a base unit. Convert before changing it."
      );
    }

    // Set product.unitOfMeasurement to this sale unit name
    await product.update({ unitOfMeasurement: name });
  }

  const saleUnit = await SaleUnit.create({
    productId,
    name,
    unitQuantity,
    sellingPrice,
    baseUnit,
  });
  return saleUnit;
};

export const updateSaleUnit = async (id, data) => {
  const saleUnit = await SaleUnit.findByPk(id);
  if (!saleUnit) throw new Error("Sale unit not found");

  const isNewBase = data.baseUnit && !saleUnit.baseUnit;
  const isExistingBase = saleUnit.baseUnit;

  if (isNewBase) {
    const productId = saleUnit.productId;

    // 1. Find the current base unit
    const oldBase = await SaleUnit.findOne({
      where: { productId, baseUnit: true },
    });

    if (!oldBase) {
      // No base unit existed before — safe to assign new one
      await saleUnit.update(data);
      const product = await Product.findByPk(productId);
      if (product) {
        await product.update({
          unitOfMeasurement: data.name || saleUnit.name,
          sellingPrice: data.sellingPrice,
        });
      }
      return saleUnit;
    }

    if (oldBase.id === id) {
      // Already base unit; just update
      await saleUnit.update(data);
      return saleUnit;
    }

    const newBaseQuantity = data.unitQuantity || saleUnit.unitQuantity;
    const oldBaseQuantity = oldBase.unitQuantity;

    if (!newBaseQuantity || isNaN(newBaseQuantity)) {
      throw new Error("Invalid unit quantity for new base unit");
    }

    // 2. Calculate conversion factor: how many old base units equal one new base unit
    const conversionFactor = newBaseQuantity / oldBaseQuantity;

    // 3. Update all other units (except the new base)
    const otherUnits = await SaleUnit.findAll({
      where: {
        productId,
        id: { [Op.ne]: id },
      },
    });

    await Promise.all(
      otherUnits.map((unit) => {
        // Convert each unit's quantity to be relative to the new base unit
        const newQuantity = unit.unitQuantity / conversionFactor;
        return unit.update({
          unitQuantity: newQuantity,
        });
      })
    );

    // 4. Update product and shop quantities
    const product = await Product.findByPk(productId);
    if (product) {
      // Convert product quantity to new base unit
      const newQty = product.quantity * conversionFactor;
      await updateProduct(product.id, {
        quantity: newQty,
        unitOfMeasurement: data.name || saleUnit.name,
        sellingPrice: data.sellingPrice || saleUnit.sellingPrice,
      });

      // Update shop quantities
      const shopProduct = await Shop.findOne({
        where: { batchNumber: product.batchNumber },
      });
      console.log("Shop product:", shopProduct);
      if (shopProduct) {
        await updateProductInShop(shopProduct.id, {
          quantity: shopProduct.quantity * conversionFactor,
          unitOfMeasurement: data.name || saleUnit.name,
          sellingPrice: data.sellingPrice || saleUnit.sellingPrice,
        });
      }
    }

    // 5. Unset previous base unit
    await oldBase.update({ baseUnit: false });
  }

  if (isExistingBase && (data.name || data.sellingPrice)) {
    const product = await Product.findByPk(saleUnit.productId);
    if (product) {
      await product.update({
        unitOfMeasurement: data.name || saleUnit.name,
        sellingPrice: data.sellingPrice || product.sellingPrice,
      });

      // Update shop product
      const shopProduct = await Shop.findOne({
        where: { batchNumber: product.batchNumber },
      });
      if (shopProduct) {
        await updateProductInShop(shopProduct.id, {
          unitOfMeasurement: data.name || shopProduct.unitOfMeasurement,
          sellingPrice: data.sellingPrice || shopProduct.sellingPrice,
        });
      }
    }
  }
  // 6. Finally update the current unit
  const allowedFields = ["name", "unitQuantity", "sellingPrice", "baseUnit"];
  const safeData = Object.fromEntries(
    Object.entries(data).filter(([key]) => allowedFields.includes(key))
  );
  const updated = await saleUnit.update(safeData);

  return updated;
};

export const deleteSaleUnit = async (id) => {
  const saleUnit = await SaleUnit.findByPk(id);
  if (!saleUnit) throw new Error("Sale unit not found");

  await saleUnit.destroy();
  return { message: "Sale unit deleted" };
};
