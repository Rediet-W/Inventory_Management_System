import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Transfer = sequelize.define(
  "Transfer",
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
    sellingPrice: {
      type: DataTypes.DECIMAL(10, 2),
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
    reference: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    storeKeeper: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    reference: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeCreate: async (transfer) => {
        transfer.reference = `T${new Date()
          .toISOString()
          .replace(/[-:.TZ]/g, "")}`;
      },
    },
  }
);

export default Transfer;
