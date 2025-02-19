import asyncHandler from "express-async-handler";
import * as userService from "../services/userService.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcryptjs";

// 📌 Utility function for structured responses
const sendResponse = (res, success, message, data = null, errors = []) => {
  res.status(success ? 200 : 400).json({ success, message, data, errors });
};

/**
 * Authenticate user & get token
 * @route   POST /api/users/login
 * @access  Public
 */
export const authUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const errors = [];

    if (!email || !password) errors.push("Email and password are required");

    if (errors.length > 0) {
      return sendResponse(res, false, "Invalid login request", null, errors);
    }

    const user = await userService.findUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return sendResponse(res, false, "Invalid email or password", null, [
        "Incorrect email or password",
      ]);
    }

    const token = generateToken(user.id);
    console.log("Generated Token:", token);

    sendResponse(res, true, "Login successful", {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isPrimaryAdmin: user.is_primary_admin,
      token,
    });
  } catch (error) {
    console.error(" Error during authentication:", error);
    sendResponse(res, false, "Login failed", null, [error.message]);
  }
});

/**
 * Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const errors = [];

    if (!name) errors.push("Name is required");
    if (!email) errors.push("Email is required");
    if (!password || password.length < 6)
      errors.push("Password must be at least 6 characters");
    if (!role) errors.push("Role is required");

    if (errors.length > 0) {
      return sendResponse(
        res,
        false,
        "Invalid registration data",
        null,
        errors
      );
    }

    const userExists = await userService.findUserByEmail(email);
    if (userExists) {
      return sendResponse(res, false, "User already exists", null, [
        "Email is already registered",
      ]);
    }

    const user = await userService.createUser(req.body);
    const token = generateToken(user.id);

    sendResponse(res, true, "User registered successfully", {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isPrimaryAdmin: user.is_primary_admin,
      token,
    });
  } catch (error) {
    console.error(" Error registering user:", error);
    sendResponse(res, false, "Registration failed", null, [error.message]);
  }
});

/**
 * Logout user
 * @route   POST /api/users/logout
 * @access  Private
 */
export const logoutUser = (req, res) => {
  try {
    res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
    sendResponse(res, true, "Logged out successfully");
  } catch (error) {
    console.error(" Error logging out:", error);
    sendResponse(res, false, "Logout failed", null, [error.message]);
  }
};

/**
 * Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await userService.findUserById(req.user.id);
    if (!user) {
      return sendResponse(res, false, "User not found", null, [
        "Invalid user ID",
      ]);
    }

    sendResponse(res, true, "User profile retrieved", {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error(" Error fetching user profile:", error);
    sendResponse(res, false, "Failed to retrieve user profile", null, [
      error.message,
    ]);
  }
});

/**
 * Update user profile
 * @route   PATCH /api/users/profile
 * @access  Private
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const updatedUser = await userService.updateUserProfile(
      req.user.id,
      req.body
    );

    if (!updatedUser) {
      return sendResponse(res, false, "User not found", null, [
        "Invalid user ID",
      ]);
    }

    sendResponse(res, true, "User profile updated", {
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    console.error(" Error updating user profile:", error);
    sendResponse(res, false, "Failed to update user profile", null, [
      error.message,
    ]);
  }
});

/**
 * Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    sendResponse(res, true, "All users retrieved successfully", users);
  } catch (error) {
    console.error(" Error fetching users:", error);
    sendResponse(res, false, "Failed to fetch users", null, [error.message]);
  }
});

/**
 * Delete user (Admin only)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  try {
    const result = await userService.deleteUser(req.params.id, req.user.id);

    if (result?.error) {
      return sendResponse(res, false, "Failed to delete user", null, [
        result.error,
      ]);
    } else if (!result) {
      return sendResponse(res, false, "User not found", null, [
        "Invalid user ID",
      ]);
    }

    sendResponse(res, true, "User deleted successfully", { success: true });
  } catch (error) {
    console.error(" Error deleting user:", error);
    sendResponse(res, false, "Failed to delete user", null, [error.message]);
  }
});
