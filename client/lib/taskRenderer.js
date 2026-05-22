import { CheckCircle, Circle, CircleHalf } from "@phosphor-icons/react";

export const renderTaskItem = (task, size = 16, truncate = true) => (
  <div key={task._id} className="flex items-start gap-2 text-sm">
    {task.status === "completed" ? (
      <CheckCircle className="text-primary mt-0.5 shrink-0" weight="fill" size={size} />
    ) : task.status === "in progress" ? (
      <CircleHalf className="text-primary mt-0.5 shrink-0 animate-pulse" weight="fill" size={size} />
    ) : (
      <Circle className="text-neutral-600 mt-0.5 shrink-0" weight="duotone" size={size} />
    )}
    <span className={`font-light ${truncate ? "truncate" : ""} ${task.status === "completed" ? "text-neutral-500 line-through decoration-neutral-700" : "text-neutral-300"}`}>
      {task.title}
    </span>
  </div>
);
