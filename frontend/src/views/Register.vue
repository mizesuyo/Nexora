<template>
  <div class="register-container">
    <div class="register-box">
      <h2>注册</h2>
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            type="text"
            id="username"
            v-model="form.username"
            required
            placeholder="请输入用户名"
            :disabled="userStore.loading"
          />
        </div>
        <div class="form-group">
          <label for="email">邮箱</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            required
            placeholder="请输入邮箱"
            :disabled="userStore.loading"
          />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            required
            placeholder="请输入密码"
            :disabled="userStore.loading"
          />
        </div>
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="form.confirmPassword"
            required
            placeholder="请再次输入密码"
            :disabled="userStore.loading"
          />
        </div>
        <div class="error-message" v-if="error || userStore.error">
          {{ error || userStore.error }}
        </div>
        <button type="submit" :disabled="userStore.loading">
          {{ userStore.loading ? '注册中...' : '注册' }}
        </button>
        <div class="links">
          <router-link to="/login">已有账号？立即登录</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

const router = useRouter();
const userStore = useUserStore();

const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const error = ref('');

const validateForm = () => {
  error.value = '';
  
  if (form.value.password !== form.value.confirmPassword) {
    error.value = '两次输入的密码不一致';
    return false;
  }
  
  if (form.value.password.length < 6) {
    error.value = '密码长度不能少于6位';
    return false;
  }
  
  return true;
};

const handleRegister = async () => {
  if (!validateForm()) return;
  
  try {
    const { username, email, password } = form.value;
    await userStore.register({ username, email, password });
    router.push('/');
  } catch (err) {
    // 错误已在 store 中处理
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.register-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-size: 0.9rem;
  color: #666;
}

input {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #4a90e2;
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

button {
  background-color: #4a90e2;
  color: white;
  padding: 0.8rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #357abd;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #ff4d4f;
  font-size: 0.9rem;
  text-align: center;
}

.links {
  text-align: center;
  font-size: 0.9rem;
}

.links a {
  color: #4a90e2;
  text-decoration: none;
}

.links a:hover {
  text-decoration: underline;
}
</style> 