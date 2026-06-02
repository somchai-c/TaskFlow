import { Router } from 'express';
import { getTasks, getTask, createTask, updateTask, patchTaskStatus, deleteTask } from '../controllers/taskController';
import { getComments, createComment } from '../controllers/commentController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT as any);

// Task core endpoints
router.get('/', getTasks as any);
router.post('/', createTask as any);
router.get('/:id', getTask as any);
router.put('/:id', updateTask as any);
router.patch('/:id/status', patchTaskStatus as any);
router.delete('/:id', deleteTask as any);

// Timeline / Comment endpoints
router.get('/:taskId/comments', getComments as any);
router.post('/:taskId/comments', createComment as any);

export default router;
