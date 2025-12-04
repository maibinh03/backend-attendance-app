import express from 'express';
import authRoutes from './authRoutes';
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} from '../controller/userController';
import { authMiddleware } from '../middleware/auth';
import { requireAdmin, requireAdminOrManager } from '../middleware/authorize';

const router = express.Router();

router.use('/', authRoutes);

// User routes - Tất cả đều cần xác thực
// GET /api/users - Chỉ admin và manager mới xem được danh sách
router.get('/users', authMiddleware, requireAdminOrManager, getAllUsers);

// GET /api/users/:id - User có thể xem thông tin của chính mình, admin/manager xem được tất cả
// Logic kiểm tra quyền được xử lý trong controller
router.get('/users/:id', authMiddleware, getUserById);

// PUT /api/users/:id - User có thể cập nhật thông tin của chính mình, admin có thể cập nhật tất cả
// Logic kiểm tra quyền được xử lý trong controller
router.put('/users/:id', authMiddleware, updateUser);

// DELETE /api/users/:id - Chỉ admin mới xóa được user
router.delete('/users/:id', authMiddleware, requireAdmin, deleteUser);

export default router;
