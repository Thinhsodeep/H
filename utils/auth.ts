import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  email: string;
  password: string;
  name?: string;
}

const USERS_KEY = '@users';
const CURRENT_USER_KEY = '@current_user';

export const auth = {
  // Đăng ký người dùng mới
  async register(email: string, password: string, name: string): Promise<{ success: boolean; message: string }> {
    try {
      // Lấy danh sách người dùng hiện tại
      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      const users: User[] = usersJson ? JSON.parse(usersJson) : [];

      // Kiểm tra email đã tồn tại chưa
      if (users.some(user => user.email === email)) {
        return { success: false, message: 'Email đã được sử dụng' };
      }

      // Thêm người dùng mới
      const newUser: User = { email, password, name };
      users.push(newUser);

      // Lưu danh sách người dùng mới
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

      return { success: true, message: 'Đăng ký thành công' };
    } catch (error) {
      return { success: false, message: 'Có lỗi xảy ra khi đăng ký' };
    }
  },

  // Đăng nhập
  async login(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // Lấy danh sách người dùng
      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      const users: User[] = usersJson ? JSON.parse(usersJson) : [];

      // Tìm người dùng
      const user = users.find(u => u.email === email && u.password === password);

      if (!user) {
        return { success: false, message: 'Email hoặc mật khẩu không đúng' };
      }

      // Lưu thông tin người dùng hiện tại
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

      return { success: true, message: 'Đăng nhập thành công', user };
    } catch (error) {
      return { success: false, message: 'Có lỗi xảy ra khi đăng nhập' };
    }
  },

  // Đăng xuất
  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
      return { success: true, message: 'Đăng xuất thành công' };
    } catch (error) {
      return { success: false, message: 'Có lỗi xảy ra khi đăng xuất' };
    }
  },

  // Kiểm tra trạng thái đăng nhập
  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      return null;
    }
  },
}; 