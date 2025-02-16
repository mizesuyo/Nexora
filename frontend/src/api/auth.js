import api from './index';

export const authApi = {
  // 用户注册
  register: async (userData) => {
    return api.post('/users/register', userData);
  },

  // 用户登录
  login: async (credentials) => {
    return api.post('/users/login', credentials);
  },

  // 获取当前用户信息
  getCurrentUser: async () => {
    return api.get('/users/me');
  },

  // 更新用户信息
  updateProfile: async (userData) => {
    return api.put('/users/profile', userData);
  },

  // 修改密码
  changePassword: async (passwordData) => {
    return api.put('/users/password', passwordData);
  }
}; 