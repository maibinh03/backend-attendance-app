// service/authService.ts
import userStore from '../model/User';
import { comparePassword, hashPassword } from '../utils/hashPassword';
import type { User } from '../model/User';
import { UserRole } from '../types/roles';

export interface LoginResult {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    username: string;
    email?: string;
    fullName?: string;
    role: UserRole;
  };
  message?: string;
}

export interface RegisterResult {
  success: boolean;
  user?: {
    id: number;
    username: string;
    email?: string;
    fullName?: string;
    role: UserRole;
  };
  message?: string;
}

export const loginUser = async (username: string, password: string): Promise<LoginResult> => {
  try {
    const user = await userStore.findByUsername(username);

    if (!user || !comparePassword(password, user.password)) {
      return {
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      };
    }

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role || UserRole.USER
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Đã xảy ra lỗi khi đăng nhập'
    };
  }
};

export const registerUser = async (
  username: string,
  password: string,
  email?: string,
  fullName?: string
): Promise<RegisterResult> => {
  try {
    // Kiểm tra username đã tồn tại chưa
    if (await userStore.findByUsername(username)) {
      return {
        success: false,
        message: 'Tên đăng nhập đã tồn tại'
      };
    }

    // Validate password
    if (password.length < 6) {
      return {
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự'
      };
    }

    // Validate email
    if (email && !email.includes('@')) {
      return {
        success: false,
        message: 'Email không hợp lệ'
      };
    }

    // Validate fullName
    if (fullName && fullName.length < 3) {
      return {
        success: false,
        message: 'Tên đầy đủ phải có ít nhất 3 ký tự'
      };
    }

    // Hash password trước khi lưu
    const hashedPassword = hashPassword(password);
    const user = await userStore.create({
      username,
      password: hashedPassword,
      email,
      fullName
    });

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role || UserRole.USER
      }
    };
  } catch (error) {
    console.error('Register error:', error);
    return {
      success: false,
      message: 'Đã xảy ra lỗi khi đăng ký'
    };
  }
};

export const createUser = async (
  username: string,
  password: string,
  email?: string,
  fullName?: string
): Promise<User> => {
  const hashedPassword = hashPassword(password);
  return await userStore.create({
    username,
    password: hashedPassword,
    email,
    fullName
  });
};

