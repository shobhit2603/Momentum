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
