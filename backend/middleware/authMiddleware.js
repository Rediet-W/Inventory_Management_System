import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.warn("🚨 No token found in cookies");
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "name", "email", "role", "is_primary_admin"],
    });

    if (!user) {
      console.warn("🚨 User not found for token:", decoded.id);
      res.status(401);
      throw new Error("Not authorized, user not found");
    }

    // Attach user to the request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isPrimaryAdmin: user.is_primary_admin,
    };

    next();
  } catch (error) {
    console.error("🚨 Token verification failed:", error);
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});

export { protect };
