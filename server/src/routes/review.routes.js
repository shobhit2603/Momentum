import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  addReview,
  getMyReviews,
  getFriendReviews,
} from "../controllers/review.controller.js";

const reviewRouter = Router();

// All review routes require authentication
reviewRouter.use(authMiddleware);

reviewRouter.post("/", addReview);
reviewRouter.get("/me/today", getMyReviews);
reviewRouter.get("/friend/:friendId/today", getFriendReviews);

export default reviewRouter;
