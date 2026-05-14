import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createTask,
  getTodayTasks,
  updateTaskStatus,
  getTaskHistory,
  getFriendTasks,
  getAllFriendsTasks,
} from "../controllers/task.controller.js";

const taskRouter = Router();

// All task routes require authentication
taskRouter.use(authMiddleware);

taskRouter.post("/", createTask);
taskRouter.get("/today", getTodayTasks);
taskRouter.get("/friends/today", getAllFriendsTasks);
taskRouter.get("/history", getTaskHistory);
taskRouter.patch("/:taskId/status", updateTaskStatus);
taskRouter.get("/friend/:friendId/today", getFriendTasks);

export default taskRouter;
