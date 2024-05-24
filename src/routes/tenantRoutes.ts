import { Router } from 'express';
import { registerTenant } from '../controllers/tenantController';

const router = Router();

router.post('/register', registerTenant);

export default router;
