import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const RequestedProduct = sequelize.define(
  "RequestedProduct",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    product_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // Default quantity is 1
      allowNull: false,
    },
    date_requested: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "purchased", "fulfilled"),
      defaultValue: "pending", // Default status is 'pending'
      allowNull: false,
    },
  },
  {
    timestamps: true, // Automatically handle created_at and updated_at
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default RequestedProduct;
