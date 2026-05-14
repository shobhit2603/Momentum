import { Router } from "express";
import passport from "passport";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  googleAuthController,
  getCurrentUser,
  logoutController,
  getProfile,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  getFriends,
} from "../controllers/user.controller.js";

const userRouter = Router();

// --- Auth Routes ---
userRouter.get(
  "/google",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
  })
);

userRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/",
  }),
  googleAuthController
);

userRouter.get("/me", authMiddleware, getCurrentUser);
userRouter.post("/logout", authMiddleware, logoutController);

// --- User Routes (Requires Auth) ---
userRouter.use(authMiddleware);

userRouter.get("/profile", getProfile);
userRouter.get("/search", searchUsers);
userRouter.get("/friends", getFriends);
userRouter.post("/friend-request", sendFriendRequest);
userRouter.post("/friend-request/accept", acceptFriendRequest);

export default userRouter;
