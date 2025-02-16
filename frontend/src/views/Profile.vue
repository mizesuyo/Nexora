<template>
  <div class="profile-page">
    <!-- 个人信息卡片 -->
    <div class="profile-card">
      <div class="avatar-section">
        <img :src="userStore.user?.avatar || '/default-avatar.png'" alt="用户头像" class="avatar" />
        <h2>{{ userStore.user?.username }}</h2>
        <p class="email">{{ userStore.user?.email }}</p>
      </div>
      <div class="stats">
        <div class="stat-item">
          <span class="number">{{ myPrompts.length }}</span>
          <span class="label">创建的提示词</span>
        </div>
        <div class="stat-item">
          <span class="number">{{ purchasedPrompts.length }}</span>
          <span class="label">购买的提示词</span>
        </div>
      </div>
      <button class="edit-profile-btn" @click="showEditProfile = true">
        编辑个人信息
      </button>
    </div>

    <!-- 标签页导航 -->
    <div class="tabs">
      <button 
        :class="['tab-btn', { active: activeTab === 'purchased' }]"
        @click="activeTab = 'purchased'"
      >
        已购买的提示词
      </button>
      <button 
        :class="['tab-btn', { active: activeTab === 'created' }]"
        @click="activeTab = 'created'"
      >
        我的创作
      </button>
      <button 
        :class="['tab-btn', { active: activeTab === 'settings' }]"
        @click="activeTab = 'settings'"
      >
        账号设置
      </button>
    </div>

    <!-- 已购买的提示词 -->
    <div v-if="activeTab === 'purchased'" class="tab-content">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
      <div v-else-if="purchasedPrompts.length === 0" class="empty-state">
        <p>还没有购买任何提示词</p>
        <router-link to="/prompts" class="btn">浏览提示词市场</router-link>
      </div>
      <div v-else class="prompts-grid">
        <div v-for="prompt in purchasedPrompts" :key="prompt.id" class="prompt-card">
          <div class="prompt-header">
            <h3>{{ prompt.title }}</h3>
            <span class="price">¥{{ prompt.price.toFixed(2) }}</span>
          </div>
          <p class="content">{{ prompt.content }}</p>
          <div class="prompt-footer">
            <span class="category">{{ prompt.category }}</span>
            <span class="purchase-date">{{ formatDate(prompt.PromptPurchase.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 我的创作 -->
    <div v-if="activeTab === 'created'" class="tab-content">
      <div class="action-bar">
        <button class="create-btn" @click="showCreatePrompt = true">
          创建新提示词
        </button>
      </div>
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
      <div v-else-if="myPrompts.length === 0" class="empty-state">
        <p>还没有创建任何提示词</p>
        <button class="btn" @click="showCreatePrompt = true">创建第一个提示词</button>
      </div>
      <div v-else class="prompts-grid">
        <div v-for="prompt in myPrompts" :key="prompt.id" class="prompt-card">
          <div class="prompt-header">
            <h3>{{ prompt.title }}</h3>
            <div class="actions">
              <button class="edit-btn" @click="handleEditPrompt(prompt)">编辑</button>
              <button class="delete-btn" @click="handleDeletePrompt(prompt)">删除</button>
            </div>
          </div>
          <p class="preview">{{ prompt.preview }}</p>
          <div class="prompt-stats">
            <span class="stat">
              <i class="icon-purchase"></i>
              {{ prompt.purchaseCount }} 次购买
            </span>
            <span class="stat">
              <i class="icon-star"></i>
              {{ prompt.rating.toFixed(1) }} ({{ prompt.ratingCount }})
            </span>
          </div>
          <div class="prompt-footer">
            <span class="category">{{ prompt.category }}</span>
            <span class="price">¥{{ prompt.price.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 账号设置 -->
    <div v-if="activeTab === 'settings'" class="tab-content settings">
      <div class="settings-section">
        <h3>修改密码</h3>
        <form @submit.prevent="handleChangePassword" class="password-form">
          <div class="form-group">
            <label>当前密码</label>
            <input 
              type="password" 
              v-model="passwordForm.currentPassword"
              required
            />
          </div>
          <div class="form-group">
            <label>新密码</label>
            <input 
              type="password" 
              v-model="passwordForm.newPassword"
              required
              minlength="6"
            />
          </div>
          <div class="form-group">
            <label>确认新密码</label>
            <input 
              type="password" 
              v-model="passwordForm.confirmPassword"
              required
            />
          </div>
          <div v-if="passwordError" class="error-message">
            {{ passwordError }}
          </div>
          <button type="submit" class="btn" :disabled="changingPassword">
            {{ changingPassword ? '修改中...' : '修改密码' }}
          </button>
        </form>
      </div>
    </div>

    <!-- 编辑个人信息对话框 -->
    <div v-if="showEditProfile" class="dialog-overlay" @click="showEditProfile = false">
      <div class="dialog" @click.stop>
        <h3>编辑个人信息</h3>
        <form @submit.prevent="handleUpdateProfile" class="edit-profile-form">
          <div class="form-group">
            <label>用户名</label>
            <input 
              type="text" 
              v-model="profileForm.username"
              required
            />
          </div>
          <div class="form-group">
            <label>邮箱</label>
            <input 
              type="email" 
              v-model="profileForm.email"
              required
            />
          </div>
          <div v-if="profileError" class="error-message">
            {{ profileError }}
          </div>
          <div class="dialog-actions">
            <button type="button" class="btn cancel" @click="showEditProfile = false">
              取消
            </button>
            <button type="submit" class="btn confirm" :disabled="updatingProfile">
              {{ updatingProfile ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 创建/编辑提示词对话框 -->
    <div v-if="showCreatePrompt" class="dialog-overlay" @click="closePromptDialog">
      <div class="dialog large" @click.stop>
        <h3>{{ editingPrompt ? '编辑提示词' : '创建新提示词' }}</h3>
        <form @submit.prevent="handleSubmitPrompt" class="prompt-form">
          <div class="form-group">
            <label>标题</label>
            <input 
              type="text" 
              v-model="promptForm.title"
              required
              placeholder="输入提示词标题"
            />
          </div>
          <div class="form-group">
            <label>预览内容</label>
            <textarea 
              v-model="promptForm.preview"
              required
              placeholder="输入预览内容（公开可见）"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label>完整内容</label>
            <textarea 
              v-model="promptForm.content"
              required
              placeholder="输入完整提示词内容（仅购买后可见）"
              rows="6"
            ></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>分类</label>
              <select v-model="promptForm.category" required>
                <option value="">选择分类</option>
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>价格</label>
              <input 
                type="number" 
                v-model="promptForm.price"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div class="form-group">
            <label>标签</label>
            <input 
              type="text" 
              v-model="promptForm.tagsInput"
              placeholder="输入标签，用逗号分隔"
            />
          </div>
          <div v-if="promptError" class="error-message">
            {{ promptError }}
          </div>
          <div class="dialog-actions">
            <button type="button" class="btn cancel" @click="closePromptDialog">
              取消
            </button>
            <button type="submit" class="btn confirm" :disabled="submittingPrompt">
              {{ submittingPrompt ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="showDeleteConfirm" class="dialog-overlay" @click="showDeleteConfirm = false">
      <div class="dialog" @click.stop>
        <h3>确认删除</h3>
        <p>确定要删除这个提示词吗？此操作不可恢复。</p>
        <div class="dialog-actions">
          <button class="btn cancel" @click="showDeleteConfirm = false">
            取消
          </button>
          <button 
            class="btn delete" 
            @click="confirmDeletePrompt"
            :disabled="deleting"
          >
            {{ deleting ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '../stores/user';
import { promptsApi } from '../api/prompts';

const userStore = useUserStore();

// 状态
const activeTab = ref('purchased');
const loading = ref(false);
const purchasedPrompts = ref([]);
const myPrompts = ref([]);
const categories = ref([]);

// 表单状态
const showEditProfile = ref(false);
const showCreatePrompt = ref(false);
const showDeleteConfirm = ref(false);
const profileError = ref('');
const passwordError = ref('');
const promptError = ref('');
const updatingProfile = ref(false);
const changingPassword = ref(false);
const submittingPrompt = ref(false);
const deleting = ref(false);

// 编辑状态
const editingPrompt = ref(null);
const promptToDelete = ref(null);

// 表单数据
const profileForm = ref({
  username: userStore.user?.username || '',
  email: userStore.user?.email || ''
});

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const promptForm = ref({
  title: '',
  preview: '',
  content: '',
  category: '',
  price: 0,
  tagsInput: ''
});

// 获取已购买的提示词
const fetchPurchasedPrompts = async () => {
  try {
    loading.value = true;
    const response = await promptsApi.getPurchasedPrompts();
    purchasedPrompts.value = response.prompts;
  } catch (error) {
    console.error('获取已购买提示词失败:', error);
  } finally {
    loading.value = false;
  }
};

// 获取我创建的提示词
const fetchMyPrompts = async () => {
  try {
    loading.value = true;
    const response = await promptsApi.getMyPrompts();
    myPrompts.value = response.prompts;
  } catch (error) {
    console.error('获取我的提示词失败:', error);
  } finally {
    loading.value = false;
  }
};

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await promptsApi.getCategories();
    categories.value = response.categories;
  } catch (error) {
    console.error('获取分类列表失败:', error);
  }
};

// 更新个人信息
const handleUpdateProfile = async () => {
  try {
    updatingProfile.value = true;
    profileError.value = '';
    await userStore.updateProfile(profileForm.value);
    showEditProfile.value = false;
  } catch (error) {
    profileError.value = error.response?.data?.message || '更新失败';
  } finally {
    updatingProfile.value = false;
  }
};

// 修改密码
const handleChangePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = '两次输入的密码不一致';
    return;
  }

  try {
    changingPassword.value = true;
    passwordError.value = '';
    await userStore.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    });
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  } catch (error) {
    passwordError.value = error.response?.data?.message || '修改密码失败';
  } finally {
    changingPassword.value = false;
  }
};

// 处理提示词表单提交
const handleSubmitPrompt = async () => {
  try {
    submittingPrompt.value = true;
    promptError.value = '';

    const promptData = {
      ...promptForm.value,
      tags: promptForm.value.tagsInput.split(',').map(tag => tag.trim()).filter(Boolean)
    };
    delete promptData.tagsInput;

    if (editingPrompt.value) {
      await promptsApi.updatePrompt(editingPrompt.value.id, promptData);
    } else {
      await promptsApi.createPrompt(promptData);
    }

    await fetchMyPrompts();
    closePromptDialog();
  } catch (error) {
    promptError.value = error.response?.data?.message || '保存失败';
  } finally {
    submittingPrompt.value = false;
  }
};

// 处理编辑提示词
const handleEditPrompt = (prompt) => {
  editingPrompt.value = prompt;
  promptForm.value = {
    title: prompt.title,
    preview: prompt.preview,
    content: prompt.content,
    category: prompt.category,
    price: prompt.price,
    tagsInput: prompt.tags.join(', ')
  };
  showCreatePrompt.value = true;
};

// 处理删除提示词
const handleDeletePrompt = (prompt) => {
  promptToDelete.value = prompt;
  showDeleteConfirm.value = true;
};

// 确认删除提示词
const confirmDeletePrompt = async () => {
  if (!promptToDelete.value) return;

  try {
    deleting.value = true;
    await promptsApi.deletePrompt(promptToDelete.value.id);
    await fetchMyPrompts();
    showDeleteConfirm.value = false;
  } catch (error) {
    console.error('删除提示词失败:', error);
  } finally {
    deleting.value = false;
    promptToDelete.value = null;
  }
};

// 关闭提示词对话框
const closePromptDialog = () => {
  showCreatePrompt.value = false;
  editingPrompt.value = null;
  promptForm.value = {
    title: '',
    preview: '',
    content: '',
    category: '',
    price: 0,
    tagsInput: ''
  };
  promptError.value = '';
};

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 页面加载时获取数据
onMounted(() => {
  fetchPurchasedPrompts();
  fetchMyPrompts();
  fetchCategories();
});
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.avatar-section {
  margin-bottom: 1.5rem;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin-bottom: 1rem;
}

.email {
  color: #666;
  margin-top: 0.5rem;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  text-align: center;
}

.number {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #4a90e2;
}

.label {
  color: #666;
  font-size: 0.9rem;
}

.edit-profile-btn {
  background: #4a90e2;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-profile-btn:hover {
  background: #357abd;
}

.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.tab-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  background: none;
  color: #666;
  cursor: pointer;
  font-size: 1rem;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #4a90e2;
  border-bottom-color: #4a90e2;
}

.tab-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-bar {
  margin-bottom: 1.5rem;
}

.create-btn {
  background: #4a90e2;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.create-btn:hover {
  background: #357abd;
}

.prompts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.prompt-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.prompt-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.prompt-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.edit-btn,
.delete-btn {
  padding: 0.3rem 0.6rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.edit-btn {
  background: #4a90e2;
  color: white;
}

.edit-btn:hover {
  background: #357abd;
}

.delete-btn {
  background: #ff4d4f;
  color: white;
}

.delete-btn:hover {
  background: #cf1322;
}

.preview {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.prompt-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #666;
  font-size: 0.9rem;
}

.prompt-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category {
  background: #e8f0fe;
  color: #4a90e2;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.price {
  color: #4a90e2;
  font-weight: 500;
}

.settings-section {
  max-width: 500px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.error-message {
  color: #ff4d4f;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
}

.dialog.large {
  max-width: 700px;
}

.dialog h3 {
  margin: 0 0 1.5rem 0;
  color: #333;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn.cancel {
  background: white;
  border: 1px solid #ddd;
  color: #666;
}

.btn.confirm {
  background: #4a90e2;
  color: white;
}

.btn.delete {
  background: #ff4d4f;
  color: white;
}

.btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 3rem;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4a90e2;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-state p {
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
  }

  .tabs {
    flex-direction: column;
  }

  .tab-btn {
    width: 100%;
    text-align: center;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .prompts-grid {
    grid-template-columns: 1fr;
  }
}
</style> 