import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const User = sequelize.define(
  "User",
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
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true, // Ensure email is unique
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("user", "admin", "superAdmin"),
      defaultValue: "user", // Default role is 'user'
      allowNull: false,
    },
    is_primary_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Default value for is_primary_admin is false
    },
  },
  {
    timestamps: true, // Automatically handle created_at and updated_at
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default User;
