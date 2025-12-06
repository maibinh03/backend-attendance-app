// controllers/authController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { loginUser, registerUser } from '../service/authService';

interface LoginRequestBody {
    username: string;
    password: string;
}

interface RegisterRequestBody {
    username: string;
    password: string;
    email?: string;
    fullName?: string;
}

export const login = async (req: Request<{}, {}, LoginRequestBody>, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tên đăng nhập và mật khẩu'
            });
            return;
        }

        // Authenticate user
        const loginResult = await loginUser(username, password);

        if (!loginResult.success || !loginResult.user) {
            res.status(401).json({
                success: false,
                message: loginResult.message || 'Tên đăng nhập hoặc mật khẩu không đúng'
            });
            return;
        }

        // Generate JWT token
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            console.error('JWT_SECRET is not configured');
            res.status(500).json({
                success: false,
                message: 'Cấu hình server không đúng'
            });
            return;
        }

        const token = jwt.sign(
            {
                id: loginResult.user.id,
                username: loginResult.user.username,
                role: loginResult.user.role
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: loginResult.user.id,
                username: loginResult.user.username,
                email: loginResult.user.email,
                fullName: loginResult.user.fullName,
                role: loginResult.user.role
            }
        });
    } catch (error: unknown) {
        console.error('Login controller error:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Đã xảy ra lỗi khi xử lý yêu cầu đăng nhập'
        });
    }
};

export const register = async (req: Request<{}, {}, RegisterRequestBody>, res: Response): Promise<void> => {
    try {
        const { username, password, email, fullName } = req.body;

        // Validate input
        if (!username || !password) {
            res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tên đăng nhập và mật khẩu'
            });
            return;
        }

        // Register user
        const registerResult = await registerUser(username, password, email, fullName);

        if (!registerResult.success || !registerResult.user) {
            res.status(400).json({
                success: false,
                message: registerResult.message || 'Đăng ký thất bại'
            });
            return;
        }



        // Generate JWT token
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            console.error('JWT_SECRET is not configured');
            res.status(500).json({
                success: false,
                message: 'Cấu hình server không đúng'
            });
            return;
        }

        const token = jwt.sign(
            {
                id: registerResult.user.id,
                username: registerResult.user.username,
                role: registerResult.user.role
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: registerResult.user.id,
                username: registerResult.user.username,
                email: registerResult.user.email,
                fullName: registerResult.user.fullName,
                role: registerResult.user.role
            }
        });
    } catch (error: unknown) {
        console.error('Register controller error:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Đã xảy ra lỗi khi xử lý yêu cầu đăng ký'
        });
    }
};
