import { Router, RequestHandler } from "express";
import { z } from "zod";
import { validateBody } from "../middlewares/validation";
import { UserService } from "../services/user";
import { logger } from "../utils/logger";

const router = Router();

const signupSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

const handleSignup: RequestHandler = async (req, res) => {
  try {
    const { name, email, password } = req.body as z.infer<typeof signupSchema>;
    const created = await UserService.createUser(email, password, name);
    return res.status(201).json({ userId: created.id, email: created.email });
  } catch (err: any) {
    logger.error("Auth signup error", { error: String(err) });
    if (err instanceof Error && err.message.includes("already exists")) {
      return res.status(409).json({ error: err.message, code: "USER_EXISTS" });
    }
    return res.status(500).json({ error: "Failed to create user", code: "SIGNUP_ERROR" });
  }
};

const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body as z.infer<typeof loginSchema>;
    const result = await UserService.authenticate(email, password);
    if (!result) return res.status(401).json({ error: "Invalid email or password" });
    return res.json({ token: result.token, userId: result.user.id });
  } catch (err) {
    logger.error("Auth login error", { error: String(err) });
    return res.status(500).json({ error: "Login failed", code: "LOGIN_ERROR" });
  }
};

router.post("/signup", validateBody(signupSchema), handleSignup);
router.post("/login", validateBody(loginSchema), handleLogin);

export default router;
