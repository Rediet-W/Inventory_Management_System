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
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Shop,
        key: "id",
      },
      onDelete: "SET NULL",
    },
    product_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    batch_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    quantity_sold: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    selling_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    sale_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    user_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Sale;
