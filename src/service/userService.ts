// service/userService.ts
import userStore from '../model/User';
import type { UserCreationAttributes, User } from '../model/User';

class UserService {
  async getAllUsers(): Promise<User[]> {
    return await userStore.findAll();
  }

  async getUserById(id: number): Promise<User | null> {
    return await userStore.findById(id);
  }

  async updateUser(id: number, data: UserCreationAttributes): Promise<User | null> {
    // Bạn có thể thêm validate tại đây
    if (data.username && data.username.length < 3) {
      throw new Error("Username phải có ít nhất 3 ký tự");
    }

    return await userStore.update(id, data);
  }

  async deleteUser(id: number): Promise<boolean> {
    return await userStore.delete(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await userStore.findByEmail(email);
  }
}

export default new UserService();
