import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Shop from "./shopModel.js";

const Sale = sequelize.define(
  "Sale",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    batchNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    unitOfMeasurement: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unitSellingPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalSellingPrice: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.quantity * this.unitSellingPrice;
      },
    },
    seller: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    averageCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

export default Sale;
