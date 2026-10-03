import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. REGISTER A NEW USER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered!" });
    }

    // Scramble (Hash) the password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user in the database
    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
        role: role || 'CITIZEN', // Default to Citizen if no role is given
        department: department || null
      }
    });

    res.status(201).json({ message: "User registered successfully! ✅", userId: newUser.id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during registration." });
  }
};

// 2. LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    // Check if the password matches the scrambled password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Incorrect password!" });
    }

    // Generate the Digital ID Card (JWT Token)
    const token = jwt.sign(
      { userId: user.id, role: user.role, department: user.department },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    res.status(200).json({
      message: "Login successful! 🔓",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        department: user.department
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during login." });
  }
};