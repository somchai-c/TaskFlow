import { Router } from 'express';
import { getProjects, getProject, createProject, updateProject, deleteProject } from '../controllers/projectController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT as any);

router.get('/', getProjects as any);
router.post('/', createProject as any);
router.get('/:id', getProject as any);
router.put('/:id', updateProject as any);
router.delete('/:id', deleteProject as any);

export default router;
