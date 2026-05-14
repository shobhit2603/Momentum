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
  getPendingRequests,
} from "../controllers/user.controller.js";

const userRouter = Router();

// --- Public Auth Routes ---
userRouter.get(
  "/google",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
  }),
);

userRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}?error=GoogleAuthFailed`,
  }),
  googleAuthController,
);

// --- Protected Routes (Requires Auth) ---
// Applying middleware here protects ALL routes defined below it
userRouter.use(authMiddleware);

userRouter.get("/me", getCurrentUser);
userRouter.post("/logout", logoutController);
userRouter.get("/profile", getProfile);
userRouter.get("/search", searchUsers);
userRouter.get("/friends", getFriends);
userRouter.get("/friend-requests", getPendingRequests);
userRouter.post("/friend-request", sendFriendRequest);
userRouter.post("/friend-request/accept", acceptFriendRequest);

export default userRouter;
