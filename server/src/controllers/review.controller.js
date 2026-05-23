import * as reviewDao from "../dao/review.dao.js";
import * as userDao from "../dao/user.dao.js";
import { getIO } from "../socket.js";

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const emitReviewUpdate = async (review, revieweeId, action) => {
  try {
    const io = getIO();
    if (!io) return;
    const populatedReview = await reviewDao.getReviewById(review._id);
    if (!populatedReview) return;
    io.to(revieweeId.toString()).emit("review:received", {
      review: populatedReview,
      revieweeId,
      action,
    });
  } catch (error) {
    console.warn("Unable to emit review update:", error);
  }
};

export const addReview = async (req, res) => {
  try {
    const { revieweeId, content } = req.body;
    const reviewerId = req.user.id;

    if (!content) {
      return res.status(400).json({ success: false, message: "Review content is required" });
    }

    if (reviewerId === revieweeId) {
      return res.status(400).json({ success: false, message: "Cannot review yourself" });
    }

    const user = await userDao.getUserById(reviewerId);
    if (!user || !user.friends.includes(revieweeId)) {
      return res.status(403).json({ success: false, message: "You can only review friends" });
    }

    const { start, end } = getTodayRange();
    const existingReview = await reviewDao.getReviewByDateRange(reviewerId, revieweeId, start, end);

    if (existingReview) {
      existingReview.content = content;
      await existingReview.save();
      await emitReviewUpdate(existingReview, revieweeId, "updated");
      return res.status(200).json({ success: true, review: existingReview, message: "Review updated" });
    }

    const newReview = await reviewDao.createReview(reviewerId, revieweeId, content);
    await emitReviewUpdate(newReview, revieweeId, "created");
    res.status(201).json({ success: true, review: newReview, message: "Review added" });
  } catch (error) {
    console.error("Error in addReview:", error);
    res.status(500).json({ success: false, message: "Server error adding review" });
  }
};

export const getMyReviews = async (req, res) => {
  try {
    const { start, end } = getTodayRange();
    const reviews = await reviewDao.getReviewsForUserByDateRange(req.user.id, start, end);
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error("Error in getMyReviews:", error);
    res.status(500).json({ success: false, message: "Server error fetching reviews" });
  }
};

export const getFriendReviews = async (req, res) => {
  try {
    const { friendId } = req.params;
    const { start, end } = getTodayRange();
    const reviews = await reviewDao.getReviewsForUserByDateRange(friendId, start, end);
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error("Error in getFriendReviews:", error);
    res.status(500).json({ success: false, message: "Server error fetching friend's reviews" });
  }
};
