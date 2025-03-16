import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
const prisma = new PrismaClient();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.SECRET_KEY || "default-secret-key";

// Create a User
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    // Check if user already exists
    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({
      message: "User created successfully",
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (error) {
    console.error("Error in createUser:", error);
    res.status(500).json({ error: "Internal server error. Please try again later." });
  } finally {
    await prisma.$disconnect(); 
  }
};

// Get all Users
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsers:", error);
    res.status(500).json({ error: "Internal server error. Please try again later." });
  } finally {
    await prisma.$disconnect();
  }
};

//Get User by ID
export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: String(id) }, 
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUser:", error);
    res.status(500).json({ error: "Internal server error. Please try again later." });
  } finally {
    await prisma.$disconnect();
  }
};

//Update
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required for update." });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Update a user
    const user = await prisma.user.update({
      where: { id: String(id) },
      data: { email, password: hashedPassword },
    });

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(500).json({ error: "Internal server error. Please try again later." });
  } finally {
    await prisma.$disconnect();
  }
};

//  Delete a User
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id: String(id) },
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({ error: "Internal server error. Please try again later." });
  } finally {
    await prisma.$disconnect();
  }
};
