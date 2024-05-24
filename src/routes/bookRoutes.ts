import { Router } from 'express';
import { addBook, getBooks, getBookById, updateBook, deleteBook } from '../controllers/bookController';
import { resolveTenant } from '../middlewares/tenantResolver';
import { authenticateUser } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', resolveTenant, authenticateUser, addBook);
router.get('/', resolveTenant, authenticateUser, getBooks);
router.get('/:id', resolveTenant, authenticateUser, getBookById);
router.put('/:id', resolveTenant, authenticateUser, updateBook);
router.delete('/:id', resolveTenant, authenticateUser, deleteBook);

export default router;
