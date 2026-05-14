import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      // Updated to exactly match your flow, plus "failed" for the midnight reset
      enum: ["not started", "in progress", "completed", "failed"],
      default: "not started",
    },
    date: {
      type: Date,
      default: Date.now, // Simplified this. We will handle the "Start of Day" logic in the controller instead.
    },
  },
  { timestamps: true },
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
