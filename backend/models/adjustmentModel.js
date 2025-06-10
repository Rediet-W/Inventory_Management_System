import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Adjustment = sequelize.define("Adjustment", {
  type: {
    type: DataTypes.ENUM("sale", "purchase"),
    allowNull: false,
  },
  batchNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  oldQuantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  requestedBy: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  approvedBy: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    defaultValue: "pending",
  },
  mode: {
    type: DataTypes.ENUM("requested", "direct"),
    allowNull: false,
    // 'requested' = adjustment was requested by someone (user or admin), 'direct' = made directly by an authorized person
  },
});

export default Adjustment;
