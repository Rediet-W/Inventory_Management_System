import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in the Authorization header or cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; // Extract token from Authorization header
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt; // Extract token from cookies
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user by ID from the MySQL database using Sequelize
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      res.status(401);
      throw new Error("Not authorized, user not found");
    }

    // Attach the user object to the request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isPrimaryAdmin: user.is_primary_admin,
    };

    next();
  } catch (error) {
    console.error(error);
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});

export { protect };
