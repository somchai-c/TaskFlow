import { Response } from 'express';
import { prisma } from '../prismaClient';
import { AuthRequest } from '../middleware/authMiddleware';

export const getComments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { taskId },
      orderBy: {
        createdAt: 'asc' // Sort chronologically (oldest first)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarColor: true,
            initials: true,
            role: true
          }
        }
      }
    });

    res.status(200).json(comments);
  } catch (error) {
    console.error('Fetch comments error:', error);
    res.status(500).json({ error: 'Failed to fetch discussion stream.' });
  }
};

export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { taskId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      res.status(400).json({ error: 'Comment message cannot be empty.' });
      return;
    }

    if (message.length > 1000) {
      res.status(400).json({ error: 'Message must be under 1000 characters.' });
      return;
    }

    // Double-check task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      res.status(404).json({ error: 'Target task item not found.' });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        taskId,
        userId: req.user.id,
        message: message.trim()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarColor: true,
            initials: true,
            role: true
          }
        }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to post remark.' });
  }
};
