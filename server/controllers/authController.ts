import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const serializeUser = (user: { toObject: () => Record<string, unknown> }) => {
  const { password, ...safeUser } = user.toObject();
  return safeUser;
};

const getJwtSecret = () => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwtSecret;
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "name, email and password are required",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const createdUser = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      avatar,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: serializeUser(createdUser),
    });
  } catch (error: any) {
    console.log("Create user error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const updates = { ...req.body };

    if (updates.email) {
      updates.email = String(updates.email).trim().toLowerCase();
    }

    if (updates.password) {
      updates.password = await bcrypt.hash(String(updates.password), 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};


export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "name, email and password are required",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: serializeUser(user),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email and password are required",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      getJwtSecret(),
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: serializeUser(user),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
