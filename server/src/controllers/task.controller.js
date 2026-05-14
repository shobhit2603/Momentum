import * as taskDao from "../dao/task.dao.js";
import * as userDao from "../dao/user.dao.js";

// Helper to get start and end of today LOCKED to IST Timezone
const getTodayRangeIST = () => {
  const now = new Date();
  const istDateStr = now.toLocaleDateString("en-US", {
    timeZone: "Asia/Kolkata",
  });
  const [month, day, year] = istDateStr.split("/");

  // Forces the date to be calculated from 00:00:00 IST to 23:59:59 IST
  const start = new Date(
    `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00.000+05:30`,
  );
  const end = new Date(
    `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T23:59:59.999+05:30`,
  );

  return { start, end };
};

export const createTask = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title)
      return res
        .status(400)
        .json({ success: false, message: "Task title is required" });

    // Creates the task using current time
    const newTask = await taskDao.createTask(req.user.id, title, new Date());
    res.status(201).json({ success: true, task: newTask });
  } catch (error) {
    console.error("Error in createTask:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error creating task" });
  }
};

export const getTodayTasks = async (req, res) => {
  try {
    const { start, end } = getTodayRangeIST();
    const tasks = await taskDao.getTasksByDateRange(req.user.id, start, end);
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("Error in getTodayTasks:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching today's tasks" });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    // Updated validation array
    if (
      !["not started", "in progress", "completed", "failed"].includes(status)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const task = await taskDao.updateTaskStatus(req.user.id, taskId, status);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, task });
  } catch (error) {
    console.error("Error in updateTaskStatus:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error updating task" });
  }
};

export const getTaskHistory = async (req, res) => {
  try {
    const { start } = getTodayRangeIST();

    // Gets all tasks created BEFORE today's IST midnight
    const pastTasks = await taskDao.getTasksBeforeDate(req.user.id, start);

    // Auto-fail tasks in history that were left pending (The "Midnight Purge" rule)
    const processedHistory = pastTasks.map((task) => {
      if (task.status === "not started" || task.status === "in progress") {
        task.status = "failed"; // Force failed status for past days
        // Note: We aren't saving this back to the DB here to save performance,
        // just displaying it as failed to the user.
      }
      return task;
    });

    res.status(200).json({ success: true, tasks: processedHistory });
  } catch (error) {
    console.error("Error in getTaskHistory:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching task history" });
  }
};

export const getFriendTasks = async (req, res) => {
  try {
    const { friendId } = req.params;
    const { start, end } = getTodayRangeIST();
    const tasks = await taskDao.getTasksByDateRange(friendId, start, end);
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("Error in getFriendTasks:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error fetching friend's tasks",
      });
  }
};

export const getAllFriendsTasks = async (req, res) => {
  try {
    const { start, end } = getTodayRangeIST();
    const friends = await userDao.getFriends(req.user.id);
    const friendsIds = friends.map((f) => f._id);

    const tasks = await taskDao.getTasksForUsersByDateRange(
      friendsIds,
      start,
      end,
    );
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("Error in getAllFriendsTasks:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error fetching friends' tasks",
      });
  }
};
