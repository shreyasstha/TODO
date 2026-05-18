import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

export async function basicAuth(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Basic ")) {
      return res.status(401).json({ message: "Authorization required." });
    }

    const base64Credentials = header.slice(6);
    let decoded;

    try {
      decoded = Buffer.from(base64Credentials, "base64").toString("utf-8");
    } catch {
      return res.status(401).json({ message: "Invalid authorization header." });
    }

    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex === -1) {
      return res.status(401).json({ message: "Invalid credentials format." });
    }

    const username = decoded.slice(0, separatorIndex);
    const password = decoded.slice(separatorIndex + 1);

    if (!username || !password) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    req.user = { id: user.id, username: user.username };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Authentication failed." });
  }
}
