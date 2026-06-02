import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { AuthRequest } from '../middleware/authMiddleware';

// Utility helper to map tags inside prisma Task objects
const formatTaskWithTags = (t: any) => ({
  id: t.id,
  title: t.title,
  description: t.description || '',
  projectId: t.projectId,
  assigneeId: t.assigneeId || '',
  priority: t.priority,
  status: t.status,
  dueDate: t.dueDate,
  tags: t.tags.map((tt: any) => tt.tag.name)
});

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.query;

    const filterClause = projectId ? { projectId: String(projectId) } : {};

    const tasks = await prisma.task.findMany({
      where: filterClause,
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    res.status(200).json(tasks.map(formatTaskWithTags));
  } catch (error) {
    console.error('Fetch tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
};

export const getTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    res.status(200).json(formatTaskWithTags(task));
  } catch (error) {
    console.error('Fetch task details error:', error);
    res.status(500).json({ error: 'Failed to fetch task details.' });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, projectId, assigneeId, priority, status, dueDate, tags } = req.body;

    // --- Input Validation (Matches frontend flow and constraints) ---
    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Task title is required.' });
      return;
    }

    if (!projectId) {
      res.status(400).json({ error: 'Please select a project.' });
      return;
    }

    if (!dueDate) {
      res.status(400).json({ error: 'Please select a valid upcoming deadline.' });
      return;
    }

    // Virtual context current date is 2026-06-02
    const todayStr = '2026-06-02';
    if (dueDate < todayStr) {
      res.status(400).json({ error: 'Due date cannot be in the past.' });
      return;
    }

    if (description && description.length > 2000) {
      res.status(400).json({ error: 'Description exceeds maximum character length (2000 chars).' });
      return;
    }

    const newTask = await prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          title: title.trim(),
          description: description ? description.trim() : '',
          projectId,
          assigneeId: assigneeId || null,
          priority: priority || 'Medium',
          status: status || 'To Do',
          dueDate
        }
      });

      // Handle tags mapping
      if (Array.isArray(tags) && tags.length > 0) {
        for (const tagName of tags) {
          const trimmedTag = tagName.trim();
          if (!trimmedTag) continue;

          // Upsert absolute Tag
          const tag = await tx.tag.upsert({
            where: { name: trimmedTag },
            update: {},
            create: { name: trimmedTag }
          });

          // Link to Task
          await tx.taskTag.create({
            data: {
              taskId: task.id,
              tagId: tag.id
            }
          });
        }
      }

      return task;
    });

    const fullTask = await prisma.task.findUnique({
      where: { id: newTask.id },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    res.status(201).json(formatTaskWithTags(fullTask));
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task.' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, projectId, assigneeId, priority, status, dueDate, tags } = req.body;

    // --- Input Validation ---
    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Task title is required.' });
      return;
    }

    if (!projectId) {
      res.status(400).json({ error: 'Please select a project.' });
      return;
    }

    if (!dueDate) {
      res.status(400).json({ error: 'Please select a valid upcoming deadline.' });
      return;
    }

    if (description && description.length > 2000) {
      res.status(400).json({ error: 'Description exceeds maximum character length (2000 chars).' });
      return;
    }

    const updatedTask = await prisma.$transaction(async (tx) => {
      const task = await tx.task.update({
        where: { id },
        data: {
          title: title.trim(),
          description: description ? description.trim() : '',
          projectId,
          assigneeId: assigneeId || null,
          priority: priority || 'Medium',
          status: status || 'To Do',
          dueDate
        }
      });

      // Recalculate tags links
      if (Array.isArray(tags)) {
        // Drop previous TaskTag maps
        await tx.taskTag.deleteMany({
          where: { taskId: id }
        });

        for (const tagName of tags) {
          const trimmedTag = tagName.trim();
          if (!trimmedTag) continue;

          const tag = await tx.tag.upsert({
            where: { name: trimmedTag },
            update: {},
            create: { name: trimmedTag }
          });

          await tx.taskTag.create({
            data: {
              taskId: id,
              tagId: tag.id
            }
          });
        }
      }

      return task;
    });

    const fullTask = await prisma.task.findUnique({
      where: { id: updatedTask.id },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    res.status(200).json(formatTaskWithTags(fullTask));
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task.' });
  }
};

export const patchTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid workflow status.' });
      return;
    }

    const task = await prisma.task.update({
      where: { id },
      data: { status },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    res.status(200).json(formatTaskWithTags(task));
  } catch (error) {
    console.error('Patch status error:', error);
    res.status(500).json({ error: 'Failed to shift task status.' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.task.delete({
      where: { id }
    });

    res.status(200).json({ success: true, message: 'Task item successfully deleted.' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task.' });
  }
};
