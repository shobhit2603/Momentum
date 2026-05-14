import { Router } from "express";
import passport from "passport";
import {
  googleAuthController,
  getCurrentUser,
  logoutController,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const authRouter = Router();

// Google OAuth authentication
authRouter.get(
  "/google",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
  }),
);

// Google OAuth callback
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/",
  }),
  googleAuthController,
);

// Get current user
authRouter.get("/user", authMiddleware, getCurrentUser);

// Logout
authRouter.post("/logout", authMiddleware, logoutController);

export default authRouter;
