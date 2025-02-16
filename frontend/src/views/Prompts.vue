<template>
  <div class="prompts-page">
    <!-- 搜索和筛选区域 -->
    <div class="prompts-header">
      <div class="search-bar">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="搜索提示词..."
          @input="handleSearch"
        />
      </div>
      <div class="filters">
        <select v-model="selectedCategory" @change="handleFilter">
          <option value="">所有分类</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
        <select v-model="sortBy" @change="handleSort">
          <option value="rating">评分最高</option>
          <option value="newest">最新发布</option>
          <option value="price">价格从低到高</option>
        </select>
      </div>
    </div>

    <!-- 提示词列表 -->
    <div class="prompts-grid" v-if="!loading">
      <div v-for="prompt in filteredPrompts" :key="prompt.id" class="prompt-card">
        <div class="prompt-header">
          <h3>{{ prompt.title }}</h3>
          <span class="price">¥{{ prompt.price.toFixed(2) }}</span>
        </div>
        <p class="preview">{{ prompt.preview }}</p>
        <div class="tags">
          <span v-for="tag in prompt.tags" :key="tag" class="tag">
            {{ tag }}
          </span>
        </div>
        <div class="prompt-info">
          <div class="author">
            <img :src="prompt.author.avatar || '/default-avatar.png'" alt="作者头像" />
            <span>{{ prompt.author.username }}</span>
          </div>
          <div class="rating">
            <span class="stars">⭐</span>
            <span>{{ prompt.rating.toFixed(1) }}</span>
            <span class="count">({{ prompt.ratingCount }})</span>
          </div>
        </div>
        <div class="prompt-footer">
          <span class="category">{{ prompt.category }}</span>
          <button 
            class="purchase-button" 
            @click="handlePurchase(prompt)"
            :disabled="isPurchased(prompt.id)"
          >
            {{ isPurchased(prompt.id) ? '已购买' : '购买提示词' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>正在加载提示词...</p>
    </div>

    <!-- 无结果提示 -->
    <div v-if="!loading && filteredPrompts.length === 0" class="no-results">
      <p>没有找到匹配的提示词</p>
    </div>

    <!-- 分页控件 -->
    <div class="pagination" v-if="!loading && totalPages > 1">
      <button 
        :disabled="currentPage === 1" 
        @click="handlePageChange(currentPage - 1)"
      >
        上一页
      </button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button 
        :disabled="currentPage === totalPages" 
        @click="handlePageChange(currentPage + 1)"
      >
        下一页
      </button>
    </div>

    <!-- 购买确认对话框 -->
    <div v-if="showPurchaseDialog" class="dialog-overlay" @click="closePurchaseDialog">
      <div class="dialog" @click.stop>
        <h3>购买提示词</h3>
        <div class="dialog-content">
          <p>{{ selectedPrompt?.title }}</p>
          <p class="price">价格: ¥{{ selectedPrompt?.price.toFixed(2) }}</p>
        </div>
        <div class="dialog-actions">
          <button class="cancel" @click="closePurchaseDialog">取消</button>
          <button 
            class="confirm" 
            @click="confirmPurchase"
            :disabled="purchaseLoading"
          >
            {{ purchaseLoading ? '购买中...' : '确认购买' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { promptsApi } from '../api/prompts';

const router = useRouter();
const userStore = useUserStore();

// 状态
const prompts = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedCategory = ref('');
const sortBy = ref('rating');
const categories = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = 12;
const purchasedPrompts = ref([]);

// 购买对话框状态
const showPurchaseDialog = ref(false);
const selectedPrompt = ref(null);
const purchaseLoading = ref(false);

// 获取提示词列表
const fetchPrompts = async () => {
  try {
    loading.value = true;
    const response = await promptsApi.getPrompts({
      page: currentPage.value,
      limit: pageSize,
      category: selectedCategory.value,
      sort: sortBy.value,
      search: searchQuery.value
    });
    prompts.value = response.prompts;
    totalPages.value = Math.ceil(response.total / pageSize);
  } catch (error) {
    console.error('获取提示词列表失败:', error);
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

// 获取已购买的提示词
const fetchPurchasedPrompts = async () => {
  if (userStore.isLoggedIn) {
    try {
      const response = await promptsApi.getPurchasedPrompts();
      purchasedPrompts.value = response.prompts;
    } catch (error) {
      console.error('获取已购买提示词失败:', error);
    }
  }
};

// 计算过滤后的提示词列表
const filteredPrompts = computed(() => {
  return prompts.value;
});

// 检查提示词是否已购买
const isPurchased = (promptId) => {
  return purchasedPrompts.value.some(p => p.id === promptId);
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1;
  fetchPrompts();
};

// 处理筛选
const handleFilter = () => {
  currentPage.value = 1;
  fetchPrompts();
};

// 处理排序
const handleSort = () => {
  fetchPrompts();
};

// 处理分页
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchPrompts();
};

// 处理购买
const handlePurchase = (prompt) => {
  if (!userStore.isLoggedIn) {
    router.push('/login');
    return;
  }
  selectedPrompt.value = prompt;
  showPurchaseDialog.value = true;
};

// 关闭购买对话框
const closePurchaseDialog = () => {
  showPurchaseDialog.value = false;
  selectedPrompt.value = null;
  purchaseLoading.value = false;
};

// 确认购买
const confirmPurchase = async () => {
  if (!selectedPrompt.value) return;
  
  try {
    purchaseLoading.value = true;
    await promptsApi.purchasePrompt(selectedPrompt.value.id);
    await fetchPurchasedPrompts();
    closePurchaseDialog();
  } catch (error) {
    console.error('购买提示词失败:', error);
  } finally {
    purchaseLoading.value = false;
  }
};

// 页面加载时获取数据
onMounted(() => {
  fetchCategories();
  fetchPrompts();
  fetchPurchasedPrompts();
});
</script>

<style scoped>
.prompts-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.prompts-header {
  margin-bottom: 2rem;
}

.search-bar {
  margin-bottom: 1rem;
}

.search-bar input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.filters {
  display: flex;
  gap: 1rem;
}

.filters select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.prompts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.prompt-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.2s;
}

.prompt-card:hover {
  transform: translateY(-4px);
}

.prompt-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.prompt-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.price {
  color: #4a90e2;
  font-weight: 500;
  font-size: 1.1rem;
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

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  background: #f0f0f0;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #666;
}

.prompt-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.author img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #666;
  font-size: 0.9rem;
}

.stars {
  color: #ffd700;
}

.count {
  color: #999;
  font-size: 0.8rem;
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

.purchase-button {
  background: #4a90e2;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.purchase-button:hover:not(:disabled) {
  background: #357abd;
}

.purchase-button:disabled {
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

.no-results {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination button:hover:not(:disabled) {
  background: #f5f5f5;
}

.pagination button:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
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
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
}

.dialog h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.dialog-content {
  margin-bottom: 1.5rem;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.dialog-actions button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.dialog-actions .cancel {
  background: white;
  border: 1px solid #ddd;
}

.dialog-actions .confirm {
  background: #4a90e2;
  color: white;
  border: none;
}

.dialog-actions .confirm:hover:not(:disabled) {
  background: #357abd;
}

.dialog-actions .confirm:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .prompts-page {
    padding: 1rem;
  }

  .filters {
    flex-direction: column;
  }

  .prompts-grid {
    grid-template-columns: 1fr;
  }
}
</style> 