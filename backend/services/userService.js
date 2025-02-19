import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

/**
 * Find a user by email
 */
export const findUserByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};

/**
 * Create a new user
 */
export const createUser = async (data) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data.password, salt);

  return await User.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role: "user",
    is_primary_admin: data.isPrimaryAdmin || false,
  });
};

/**
 * Find a user by ID
 */
export const findUserById = async (id) => {
  return await User.findByPk(id);
};

/**
 * Get all users (Admin only)
 */
export const getAllUsers = async () => {
  return await User.findAll({
    attributes: ["id", "name", "email", "role", "is_primary_admin"],
  });
};

/**
 * Delete a user (Admin only)
 */
export const deleteUser = async (id, currentUserId) => {
  const user = await User.findByPk(id);
  if (!user) return null;

  if (user.id === currentUserId) {
    return { error: "Cannot delete your own account" };
  }
  if (user.is_primary_admin) {
    return { error: "Cannot delete the primary admin" };
  }

  await user.destroy();
  return { message: "User removed successfully" };
};

/**
 * Update user profile
 */
export const updateUserProfile = async (id, data) => {
  const user = await User.findByPk(id);
  if (!user) return null;

  user.name = data.name || user.name;
  user.email = data.email || user.email;

  if (data.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(data.password, salt);
  }

  await user.save();
  return user;
};
