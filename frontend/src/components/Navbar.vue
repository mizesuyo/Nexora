<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <router-link to="/" class="logo">AI导航</router-link>
    </div>
    <div class="navbar-menu">
      <router-link to="/" class="nav-item">首页</router-link>
      <router-link to="/tools" class="nav-item">AI工具</router-link>
      <router-link to="/prompts" class="nav-item">提示词市场</router-link>
    </div>
    <div class="navbar-end">
      <template v-if="userStore.isLoggedIn">
        <div class="user-menu" @click="toggleDropdown" ref="userMenuRef">
          <span class="username">{{ userStore.user?.username }}</span>
          <div class="dropdown" v-show="showDropdown">
            <router-link to="/profile" class="dropdown-item">个人中心</router-link>
            <a href="#" class="dropdown-item" @click.prevent="handleLogout">退出登录</a>
          </div>
        </div>
      </template>
      <template v-else>
        <router-link to="/login" class="nav-button">登录</router-link>
        <router-link to="/register" class="nav-button register">注册</router-link>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

const router = useRouter();
const userStore = useUserStore();
const showDropdown = ref(false);
const userMenuRef = ref(null);

// 检查登录状态
const checkAuth = async () => {
  if (userStore.isLoggedIn && !userStore.user) {
    try {
      await userStore.fetchCurrentUser();
    } catch (error) {
      handleLogout();
    }
  }
};

// 处理退出登录
const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};

// 切换下拉菜单
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

// 点击外部关闭下拉菜单
const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    showDropdown.value = false;
  }
};

onMounted(() => {
  checkAuth();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar-brand .logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4a90e2;
  text-decoration: none;
}

.navbar-menu {
  display: flex;
  gap: 2rem;
}

.nav-item {
  color: #666;
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.2s;
}

.nav-item:hover {
  color: #4a90e2;
}

.navbar-end {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.nav-button:not(.register) {
  color: #4a90e2;
  border: 1px solid #4a90e2;
}

.nav-button:not(.register):hover {
  background-color: #4a90e2;
  color: white;
}

.nav-button.register {
  background-color: #4a90e2;
  color: white;
}

.nav-button.register:hover {
  background-color: #357abd;
}

.user-menu {
  position: relative;
  cursor: pointer;
}

.username {
  color: #333;
  font-size: 0.9rem;
}

.dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 120px;
}

.dropdown-item {
  display: block;
  padding: 0.5rem 1rem;
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
  color: #4a90e2;
}

@media (max-width: 768px) {
  .navbar {
    padding: 1rem;
  }

  .navbar-menu {
    display: none;
  }

  .nav-button {
    padding: 0.4rem 0.8rem;
  }
}
</style> 