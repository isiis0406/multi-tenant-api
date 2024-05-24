import { Router } from 'express';
import { createUser, loginUser } from '../controllers/userController';
import { resolveTenant } from '../middlewares/tenantResolver';
import { authenticateUser } from '../middlewares/authMiddleware';

const router = Router();

router.post('/create', resolveTenant, createUser);
router.post('/login', resolveTenant, loginUser);

export default router;
