import * as taskDao from "../dao/task.dao.js";

// Helper to get start and end of today
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

export const createTask = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Task title is required" });

    const newTask = await taskDao.createTask(req.user.id, title, new Date());
    res.status(201).json({ success: true, task: newTask });
  } catch (error) {
    console.error("Error in createTask:", error);
    res.status(500).json({ success: false, message: "Server error creating task" });
  }
};

export const getTodayTasks = async (req, res) => {
  try {
    const { start, end } = getTodayRange();
    const tasks = await taskDao.getTasksByDateRange(req.user.id, start, end);
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("Error in getTodayTasks:", error);
    res.status(500).json({ success: false, message: "Server error fetching today's tasks" });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!["pending", "completed", "expired"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const task = await taskDao.updateTaskStatus(req.user.id, taskId, status);

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, task });
  } catch (error) {
    console.error("Error in updateTaskStatus:", error);
    res.status(500).json({ success: false, message: "Server error updating task" });
  }
};

export const getTaskHistory = async (req, res) => {
  try {
    const { start } = getTodayRange();
    const pastTasks = await taskDao.getTasksBeforeDate(req.user.id, start);
    res.status(200).json({ success: true, tasks: pastTasks });
  } catch (error) {
    console.error("Error in getTaskHistory:", error);
    res.status(500).json({ success: false, message: "Server error fetching task history" });
  }
};

export const getFriendTasks = async (req, res) => {
  try {
    const { friendId } = req.params;
    const { start, end } = getTodayRange();
    const tasks = await taskDao.getTasksByDateRange(friendId, start, end);
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("Error in getFriendTasks:", error);
    res.status(500).json({ success: false, message: "Server error fetching friend's tasks" });
  }
};

import * as userDao from "../dao/user.dao.js";

export const getAllFriendsTasks = async (req, res) => {
  try {
    const { start, end } = getTodayRange();
    
    // Fetch friends using userDao
    const friendsIds = await userDao.getFriends(req.user.id).then(friends => friends.map(f => f._id));
    
    const tasks = await taskDao.getTasksForUsersByDateRange(friendsIds, start, end);
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("Error in getAllFriendsTasks:", error);
    res.status(500).json({ success: false, message: "Server error fetching friends' tasks" });
  }
};
