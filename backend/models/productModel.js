import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Product = sequelize.define(
  "Product",
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
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    buyingPrice: {
      type: DataTypes.DECIMAL(10, 2), // Decimal with precision 10 and scale 2
      allowNull: false,
    },
    sellingPrice: {
      type: DataTypes.DECIMAL(10, 2), // Decimal with precision 10 and scale 2
      allowNull: false,
    },
    batchNumber: {
      type: DataTypes.STRING(50),
      allowNull: true, // Optional field
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW, // Default to current timestamp
    },
  },
  {
    timestamps: true, // This will automatically handle created_at and updated_at
    createdAt: "created_at", // Map to the existing created_at column
    updatedAt: "updated_at", // Map to the existing updated_at column
  }
);

export default Product;
