import { Router } from "express";
import { basicAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.use(basicAuth);

function validateTitle(title) {
  if (typeof title !== "string" || !title.trim()) {
    return { valid: false, message: "Task title is required and cannot be empty." };
  }
  if (title.trim().length > 500) {
    return { valid: false, message: "Task title must be 500 characters or fewer." };
  }
  return { valid: true, value: title.trim() };
}

router.get("/", async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.id },
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    });
    res.json(tasks);
  } catch (error) {
    console.error("GET /tasks error:", error);
    res.status(500).json({ message: "Failed to fetch tasks." });
  }
});

router.put("/reorder", async (req, res) => {
  try {
    const { taskIds } = req.body ?? {};

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ message: "taskIds must be a non-empty array." });
    }

    if (!taskIds.every((id) => typeof id === "string" && id.trim())) {
      return res.status(400).json({ message: "Each task id must be a non-empty string." });
    }

    const uniqueIds = new Set(taskIds);
    if (uniqueIds.size !== taskIds.length) {
      return res.status(400).json({ message: "taskIds must not contain duplicates." });
    }

    const userTasks = await prisma.task.findMany({
      where: { userId: req.user.id },
      select: { id: true },
    });

    if (taskIds.length !== userTasks.length) {
      return res.status(400).json({ message: "taskIds must include all of your tasks." });
    }

    const userTaskIds = new Set(userTasks.map((t) => t.id));
    if (!taskIds.every((id) => userTaskIds.has(id))) {
      return res.status(400).json({ message: "One or more tasks were not found." });
    }

    await prisma.$transaction(
      taskIds.map((id, index) =>
        prisma.task.update({
          where: { id },
          data: { position: index },
        })
      )
    );

    const tasks = await prisma.task.findMany({
      where: { userId: req.user.id },
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    });

    res.json(tasks);
  } catch (error) {
    console.error("PUT /tasks/reorder error:", error);
    res.status(500).json({ message: "Failed to reorder tasks." });
  }
});

router.post("/", async (req, res) => {
  try {
    const validation = validateTitle(req.body?.title);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const task = await prisma.$transaction(async (tx) => {
      await tx.task.updateMany({
        where: { userId: req.user.id },
        data: { position: { increment: 1 } },
      });

      return tx.task.create({
        data: {
          title: validation.value,
          userId: req.user.id,
          position: 0,
        },
      });
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("POST /tasks error:", error);
    res.status(500).json({ message: "Failed to create task." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body ?? {};

    const existing = await prisma.task.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!existing) {
      return res.status(404).json({ message: "Task not found." });
    }

    const data = {};

    if (title !== undefined) {
      const validation = validateTitle(title);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
      }
      data.title = validation.value;
    }

    if (completed !== undefined) {
      if (typeof completed !== "boolean") {
        return res.status(400).json({ message: "Completed must be a boolean." });
      }
      data.completed = completed;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: "No valid fields to update." });
    }

    const task = await prisma.task.update({
      where: { id },
      data,
    });
    res.json(task);
  } catch (error) {
    console.error(`PUT /tasks/${req.params.id} error:`, error);
    res.status(500).json({ message: "Failed to update task." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.task.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!existing) {
      return res.status(404).json({ message: "Task not found." });
    }

    await prisma.task.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error(`DELETE /tasks/${req.params.id} error:`, error);
    res.status(500).json({ message: "Failed to delete task." });
  }
});

export default router;
