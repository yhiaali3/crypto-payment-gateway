import prisma from "../utils/prisma";
import { hashPassword, verifyPassword, generateUserId } from "../utils/crypto";
import { logger } from "../utils/logger";
import { generateToken } from "../utils/jwt";

export class UserService {
  static async createUser(email: string, password: string, name?: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("User with this email already exists");

    const passwordHash = hashPassword(password);
    const id = generateUserId();

    const created = await prisma.user.create({ data: { id, email, password: passwordHash, name } });

    logger.info("New user created", { userId: created.id, email: created.email });

    return { id: created.id, email: created.email, name: created.name };
  }

  static async authenticate(email: string, password: string) {
    const u = await prisma.user.findUnique({ where: { email } });
    if (!u) return null;
    const ok = verifyPassword(password, u.password);
    if (!ok) return null;

    const token = generateToken({ userId: u.id, email: u.email });
    return { user: { id: u.id, email: u.email, name: u.name ?? undefined }, token };
  }
}
