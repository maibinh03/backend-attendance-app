// routes/dashboardRoutes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  res.json({ message: 'Welcome to dashboard!' });
});

export default router;
