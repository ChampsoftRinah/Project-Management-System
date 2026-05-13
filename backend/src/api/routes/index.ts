import { Router } from 'express';
import authRoutes from './auth';
import projectRoutes from './projects';
import taskRoutes from './tasks';
import userRoutes from './users';

const router = Router();

router.use('/', authRoutes);
router.use('/', projectRoutes);
router.use('/', taskRoutes);
router.use('/', userRoutes);

export default router;
