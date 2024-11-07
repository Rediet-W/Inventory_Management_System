import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Product from "./productModel.js";
const Purchase = sequelize.define(
  "Purchase",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow NULL values
      references: {
        model: Product,
        key: "id",
      },
      onDelete: "SET NULL",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    buying_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    purchase_date: {
      type: DataTypes.DATEONLY, // DATE type for just the date (without time)
      allowNull: false,
    },
    user_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    timestamps: true, // Automatically handle created_at and updated_at
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Purchase;
