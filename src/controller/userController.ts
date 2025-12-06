// controller/userController.ts
import { Response } from 'express';
import userService from '../service/userService';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../types/roles';

export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        const users = await userService.getAllUsers();
        // Ẩn password trong response
        const usersWithoutPassword = users.map(({ password, ...user }) => user);
        return res.json({
            success: true,
            data: usersWithoutPassword
        });
    } catch (error: unknown) {
        console.error('Get all users error:', error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Không thể lấy danh sách users'
        });
    }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id) || id < 1) {
            return res.status(400).json({
                success: false,
                message: 'ID không hợp lệ'
            });
        }

        const currentUser = req.user;

        // User chỉ có thể xem thông tin của chính mình, trừ khi là admin hoặc manager
        if (currentUser && currentUser.id !== id &&
            currentUser.role !== UserRole.ADMIN &&
            currentUser.role !== UserRole.MANAGER) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền xem thông tin user này"
            });
        }

        const user = await userService.getUserById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy user"
            });
        }

        // Ẩn password trong response
        const { password, ...userWithoutPassword } = user;
        return res.json({
            success: true,
            data: userWithoutPassword
        });
    } catch (error: unknown) {
        console.error('Get user by id error:', error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Không thể lấy thông tin user'
        });
    }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id) || id < 1) {
            return res.status(400).json({
                success: false,
                message: 'ID không hợp lệ'
            });
        }

        const currentUser = req.user;

        if (!currentUser) {
            return res.status(401).json({
                success: false,
                message: "Chưa xác thực"
            });
        }

        // User chỉ có thể cập nhật thông tin của chính mình, trừ khi là admin
        if (currentUser.id !== id && currentUser.role !== UserRole.ADMIN) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền cập nhật user này"
            });
        }

        // User thường không thể thay đổi role của mình, chỉ admin mới có thể
        if (currentUser.role !== UserRole.ADMIN && req.body.role) {
            delete req.body.role;
        }

        const updatedUser = await userService.updateUser(id, req.body);

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User không tồn tại"
            });
        }

        // Ẩn password trong response
        const { password, ...userWithoutPassword } = updatedUser;
        return res.json({
            success: true,
            data: userWithoutPassword
        });
    } catch (error: unknown) {
        console.error('Update user error:', error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Không thể cập nhật user'
        });
    }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id) || id < 1) {
            return res.status(400).json({
                success: false,
                message: 'ID không hợp lệ'
            });
        }

        const currentUser = req.user;
        if (currentUser && currentUser.id === id) {
            return res.status(400).json({
                success: false,
                message: "Bạn không thể xóa chính mình"
            });
        }

        const success = await userService.deleteUser(id);

        if (!success) {
            return res.status(404).json({
                success: false,
                message: "User không tồn tại"
            });
        }

        return res.json({
            success: true,
            message: "Xóa user thành công"
        });
    } catch (error: unknown) {
        console.error('Delete user error:', error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Không thể xóa user'
        });
    }
};


