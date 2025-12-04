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
        return res.json(usersWithoutPassword);
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server" });
    }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
    try {
        const id = Number(req.params.id);
        const currentUser = req.user;

        // User chỉ có thể xem thông tin của chính mình, trừ khi là admin hoặc manager
        if (currentUser && currentUser.id !== id &&
            currentUser.role !== UserRole.ADMIN &&
            currentUser.role !== UserRole.MANAGER) {
            return res.status(403).json({ message: "Bạn không có quyền xem thông tin user này" });
        }

        const user = await userService.getUserById(id);

        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy user" });
        }

        // Ẩn password trong response
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server" });
    }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
    try {
        const id = Number(req.params.id);
        const currentUser = req.user;

        if (!currentUser) {
            return res.status(401).json({ message: "Chưa xác thực" });
        }

        // User chỉ có thể cập nhật thông tin của chính mình, trừ khi là admin
        if (currentUser.id !== id && currentUser.role !== UserRole.ADMIN) {
            return res.status(403).json({ message: "Bạn không có quyền cập nhật user này" });
        }

        // User thường không thể thay đổi role của mình, chỉ admin mới có thể
        if (currentUser.role !== UserRole.ADMIN && req.body.role) {
            delete req.body.role;
        }

        const updatedUser = await userService.updateUser(id, req.body);

        if (!updatedUser) {
            return res.status(404).json({ message: "User không tồn tại" });
        }

        // Ẩn password trong response
        const { password, ...userWithoutPassword } = updatedUser;
        return res.json(userWithoutPassword);
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server" });
    }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
    try {
        const id = Number(req.params.id);
        const success = await userService.deleteUser(id);

        if (!success) {
            return res.status(404).json({ message: "User không tồn tại" });
        }

        return res.json({ message: "Xóa user thành công" });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server" });
    }
};


