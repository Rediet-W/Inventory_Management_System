import path from "path";
import express from "express";
import dotenv from "dotenv";
import { connectDB, sequelize } from "./config/db.js"; // Use Sequelize connection
import cookieParser from "cookie-parser";
import cors from "cors"; // Import CORS middleware
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import requestedProductRoutes from "./routes/requestedProductRoutes.js";
import saleRoute from "./routes/saleRoutes.js";
import purchaseRoute from "./routes/purchaseRoutes.js";
import shopRoute from "./routes/shopRoutes.js";

dotenv.config(); // Load environment variables

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Initialize the database connection and sync models
    await connectDB(); // Connect to the database using Sequelize
    await sequelize.sync(); // Sync Sequelize models with the MySQL database

    const app = express();

    // Enable CORS
    app.use(
      cors({
        origin: ["http://localhost:3000", "https://inventory-management-system-b4w1cl0w1-rediet-ws-projects.vercel.app'"], // Allowed origins
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Allowed HTTP methods
        credentials: true, // Allow cookies or Authorization headers
      })
    );

    // Middleware to parse incoming requests
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Middleware for cookies
    app.use(cookieParser());

    // Route handling
    app.use("/api/users", userRoutes);
    app.use("/api/products", productRoutes);
    app.use("/api/requested-products", requestedProductRoutes);
    app.use("/api/sales", saleRoute);
    app.use("/api/purchases", purchaseRoute);
    app.use("/api/shop", shopRoute);

    // Serve frontend assets in production
    if (process.env.NODE_ENV === "production") {
      const __dirname = path.resolve();
      app.use(express.static(path.join(__dirname, "/frontend/dist")));

      app.get("*", (req, res) =>
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
      );
    } else {
      app.get("/", (req, res) => {
        res.send("API is running....");
      });
    }

    // Error handling middlewares
    app.use(notFound);
    app.use(errorHandler);

    // Start the server
    app.listen(port, () =>
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${port}`
      )
    );
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1); // Exit process with failure code
  }
};

startServer(); // Call the function to start the server
