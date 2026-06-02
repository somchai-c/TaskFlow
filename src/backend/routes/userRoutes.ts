import { Router } from 'express';
import { getUsers } from '../controllers/userController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT as any);

router.get('/', getUsers);

export default router;
