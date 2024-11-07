import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcryptjs";

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } }); // Find user by email

  if (user && (await bcrypt.compare(password, user.password))) {
    generateToken(res, user.id);

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isPrimaryAdmin: user.is_primary_admin,
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ where: { email } });

  if (userExists) {
    res.status(400).json({ message: "User already exists" });
  } else {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user", // Default role is 'user'
    });

    generateToken(res, user.id);

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id); // Find user by ID

  if (user) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isPrimaryAdmin: user.is_primary_admin,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id); // Find user by ID

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    await user.save(); // Save updated user

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// @desc    Get all users (Admin only)
// @route   GET /api/users/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    attributes: ["id", "name", "email", "role", "is_primary_admin"],
  });
  res.json(users);
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id); // Find user by ID

  if (user) {
    if (user.id === req.user.id) {
      res.status(400).json({ message: "Cannot delete your own account" });
    } else if (user.is_primary_admin) {
      res.status(400).json({ message: "Cannot delete the primary admin" });
    } else {
      await user.destroy(); // Delete user
      res.json({ message: "User removed" });
    }
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser,
};
