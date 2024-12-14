import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "./.env" });


const sequelize = new Sequelize(
  process.env.DB_NAME || "inventory_management",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 3306, // Explicitly parse the port as an integer
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 60000, // Increased timeout
      idle: 10000,
    },
    dialectOptions: {
      connectTimeout: 60000, // Increased connection timeout
    },
    logging: console.log, // Enable detailed logging
  }
);


// Function to connect to the database
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to MySQL database successfully.");
  } catch (error) {
    console.error("Unable to connect to MySQL:", error);
    process.exit(1);
  }
};

export { sequelize, connectDB };
