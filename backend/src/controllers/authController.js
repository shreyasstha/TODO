import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import {
  formatValidationResponse,
  validateLoginInput,
  validateRegisterInput,
} from "../utils/authValidation.js";

const SALT_ROUNDS = 10;

export async function register(req, res) {
  try {
    const validation = validateRegisterInput(
      req.body?.username,
      req.body?.password
    );

    if (!validation.valid) {
      return res.status(400).json(formatValidationResponse(validation.errors));
    }

    const existing = await prisma.user.findUnique({
      where: { username: validation.username },
    });
    if (existing) {
      return res.status(409).json({
        message: "Username already exists.",
        errors: { username: "This username is already taken." },
      });
    }

    const hashedPassword = await bcrypt.hash(validation.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        username: validation.username,
        password: hashedPassword,
      },
      select: { id: true, username: true, createdAt: true },
    });

    res.status(201).json({
      message: "Registration successful.",
      user,
    });
  } catch (error) {
    console.error("POST /register error:", error);
    res.status(500).json({ message: "Failed to register user." });
  }
}

export async function login(req, res) {
  try {
    const validation = validateLoginInput(req.body?.username, req.body?.password);

    if (!validation.valid) {
      return res.status(400).json(formatValidationResponse(validation.errors));
    }

    const user = await prisma.user.findUnique({
      where: { username: validation.username },
    });
    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password.",
        errors: { username: "Invalid username or password." },
      });
    }

    const passwordValid = await bcrypt.compare(validation.password, user.password);
    if (!passwordValid) {
      return res.status(401).json({
        message: "Invalid username or password.",
        errors: { password: "Invalid username or password." },
      });
    }

    res.json({
      message: "Login successful.",
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    console.error("POST /login error:", error);
    res.status(500).json({ message: "Failed to login." });
  }
}
