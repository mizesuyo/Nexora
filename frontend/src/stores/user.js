import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '../api/auth';

export const useUserStore = defineStore('user', () => {
    // 状态
    const user = ref(null);
    const token = ref(localStorage.getItem('token') || null);
    const loading = ref(false);
    const error = ref(null);

    // 计算属性
    const isLoggedIn = computed(() => !!token.value);
    const isAdmin = computed(() => user.value?.role === 'admin');

    // 方法
    const setUser = (userData) => {
        user.value = userData;
    };

    const setToken = (tokenValue) => {
        token.value = tokenValue;
        if (tokenValue) {
            localStorage.setItem('token', tokenValue);
        } else {
            localStorage.removeItem('token');
        }
    };

    const setError = (errorMessage) => {
        error.value = errorMessage;
    };

    // 注册
    const register = async (userData) => {
        try {
            loading.value = true;
            error.value = null;
            const response = await authApi.register(userData);
            setToken(response.token);
            setUser(response.user);
            return response;
        } catch (err) {
            setError(err.response?.data?.message || '注册失败，请重试');
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // 登录
    const login = async (credentials) => {
        try {
            loading.value = true;
            error.value = null;
            const response = await authApi.login(credentials);
            setToken(response.token);
            setUser(response.user);
            return response;
        } catch (err) {
            setError(err.response?.data?.message || '登录失败，请重试');
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // 登出
    const logout = () => {
        setToken(null);
        setUser(null);
    };

    // 获取当前用户信息
    const fetchCurrentUser = async () => {
        try {
            loading.value = true;
            error.value = null;
            const response = await authApi.getCurrentUser();
            setUser(response.user);
            return response;
        } catch (err) {
            setError(err.response?.data?.message || '获取用户信息失败');
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // 更新用户信息
    const updateProfile = async (userData) => {
        try {
            loading.value = true;
            error.value = null;
            const response = await authApi.updateProfile(userData);
            setUser(response.user);
            return response;
        } catch (err) {
            setError(err.response?.data?.message || '更新个人信息失败');
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // 修改密码
    const changePassword = async (passwordData) => {
        try {
            loading.value = true;
            error.value = null;
            const response = await authApi.changePassword(passwordData);
            return response;
        } catch (err) {
            setError(err.response?.data?.message || '修改密码失败');
            throw err;
        } finally {
            loading.value = false;
        }
    };

    return {
        // 状态
        user,
        token,
        loading,
        error,
        
        // 计算属性
        isLoggedIn,
        isAdmin,
        
        // 方法
        register,
        login,
        logout,
        fetchCurrentUser,
        updateProfile,
        changePassword
    };
}); 