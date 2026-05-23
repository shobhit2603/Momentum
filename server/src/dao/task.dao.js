import Task from "../models/task.model.js";

export const createTask = async (userId, title, date) => {
  const newTask = new Task({ userId, title, date });
  return await newTask.save();
};

export const getTasksByDateRange = async (userId, start, end) => {
  return await Task.find({
    userId,
    date: { $gte: start, $lte: end },
  }).sort({ createdAt: -1 });
};

export const getTasksBeforeDate = async (userId, date) => {
  return await Task.find({
    userId,
    date: { $lt: date },
  }).sort({ date: -1 });
};

export const updateTaskStatus = async (userId, taskId, status) => {
  return await Task.findOneAndUpdate(
    { _id: taskId, userId },
    { status },
    { new: true }
  );
};

export const getTasksForUsersByDateRange = async (userIds, start, end) => {
  return await Task.find({
    userId: { $in: userIds },
    date: { $gte: start, $lte: end },
  })
    .populate("userId", "name profilePicture streak")
    .sort({ createdAt: -1 });
};

export const getCompletionStatsForUsersBeforeDate = async (userIds, beforeDate) => {
  if (!userIds || userIds.length === 0) return [];

  return await Task.aggregate([
    {
      $match: {
        userId: { $in: userIds },
        date: { $lt: beforeDate },
      },
    },
    {
      $group: {
        _id: "$userId",
        total: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
          },
        },
      },
    },
  ]);
};

export const deleteTaskById = async (userId, taskId) => {
  return await Task.findOneAndDelete(
    { _id: taskId, userId },
  );
};
