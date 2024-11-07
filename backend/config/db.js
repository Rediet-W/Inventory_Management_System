import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Initialize Sequelize with connection details
const sequelize = new Sequelize(
  process.env.DB_NAME || "inventory_management",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Function to connect to the database
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to MySQL database successfully.");
  } catch (error) {
    console.error("Unable to connect to MySQL:", error);
    process.exit(1); // Exit process if connection fails
  }
};

export { sequelize, connectDB };
