import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Product from "./productModel.js";

const SaleUnit = sequelize.define("SaleUnit", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  unitQuantity: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  sellingPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  baseUnit: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

// Associations
Product.hasMany(SaleUnit, { foreignKey: "productId", as: "saleUnits" });
SaleUnit.belongsTo(Product, { foreignKey: "productId" });

export default SaleUnit;
