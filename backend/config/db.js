import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config({ path: "./backend/.env" });
console.log(
  "📌 Connecting to MySQL:",
  process.env.DB_HOST,
  process.env.DB_PORT
);
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
    dialectOptions: {
      connectTimeout: 60000,
    },
    logging: console.log,
    dialectOptions: {
      connectTimeout: 60000,
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
    process.exit(1);
    process.exit(1);
  }
};

export { sequelize, connectDB };
