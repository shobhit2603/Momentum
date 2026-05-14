import Review from "../models/review.model.js";

export const getReviewByDateRange = async (reviewerId, revieweeId, start, end) => {
  return await Review.findOne({
    reviewerId,
    revieweeId,
    date: { $gte: start, $lte: end },
  });
};

export const createReview = async (reviewerId, revieweeId, content) => {
  const newReview = new Review({ reviewerId, revieweeId, content });
  return await newReview.save();
};

export const getReviewsForUserByDateRange = async (revieweeId, start, end) => {
  return await Review.find({
    revieweeId,
    date: { $gte: start, $lte: end },
  }).populate("reviewerId", "name profilePicture");
};
