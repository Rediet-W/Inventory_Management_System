import path from "path";
import express from "express";
import dotenv from "dotenv";
import { connectDB, sequelize } from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import requestedProductRoutes from "./routes/requestedProductRoutes.js";
import saleRoute from "./routes/saleRoutes.js";
import purchaseRoute from "./routes/purchaseRoutes.js";
import shopRoute from "./routes/shopRoutes.js";
import transferRoute from "./routes/transferRoutes.js";

dotenv.config();

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await sequelize.sync();
    const app = express();

    app.use(
      cors({
        origin: (origin, callback) => {
          // Allowed static origins
          const allowedOrigins = [
            "http://localhost:3000", // Local development
            "https://inventory-management-system.vercel.app", // Stable production URL
          ];

          if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
          }

          const regex =
            /^https:\/\/inventory-management-system-[\w-]+\.vercel\.app$/;
          if (regex.test(origin)) {
            return callback(null, true);
          }

          callback(new Error("Not allowed by CORS"));
        },
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
      })
    );
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(cookieParser());

    // Route handling
    app.use("/api/users", userRoutes);
    app.use("/api/products", productRoutes);
    app.use("/api/requested-products", requestedProductRoutes);
    app.use("/api/sales", saleRoute);
    app.use("/api/purchases", purchaseRoute);
    app.use("/api/shop", shopRoute);
    app.use("/api/transfers", transferRoute);

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
    process.exit(1);
  }
};

startServer();
