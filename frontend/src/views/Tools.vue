<template>
  <div class="tools-page">
    <!-- 搜索和筛选区域 -->
    <div class="tools-header">
      <div class="search-bar">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="搜索AI工具..."
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
          <option value="newest">最新添加</option>
          <option value="popular">最受欢迎</option>
        </select>
      </div>
    </div>

    <!-- 工具列表 -->
    <div class="tools-grid" v-if="!loading">
      <div v-for="tool in filteredTools" :key="tool.id" class="tool-card">
        <div class="tool-icon">
          <img :src="tool.icon" :alt="tool.name" />
        </div>
        <div class="tool-info">
          <h3>{{ tool.name }}</h3>
          <p class="description">{{ tool.description }}</p>
          <div class="tags">
            <span v-for="tag in tool.tags" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>
          <div class="tool-footer">
            <span class="category">{{ tool.category }}</span>
            <div class="rating">
              <span class="stars">⭐</span>
              <span>{{ tool.rating.toFixed(1) }}</span>
              <span class="count">({{ tool.ratingCount }})</span>
            </div>
          </div>
          <a :href="tool.url" target="_blank" class="visit-button">访问工具</a>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>正在加载AI工具...</p>
    </div>

    <!-- 无结果提示 -->
    <div v-if="!loading && filteredTools.length === 0" class="no-results">
      <p>没有找到匹配的AI工具</p>
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { toolsApi } from '../api/tools';

// 状态
const tools = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedCategory = ref('');
const sortBy = ref('rating');
const categories = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = 12;

// 获取工具列表
const fetchTools = async () => {
  try {
    loading.value = true;
    const response = await toolsApi.getTools({
      page: currentPage.value,
      limit: pageSize,
      category: selectedCategory.value,
      sort: sortBy.value,
      search: searchQuery.value
    });
    tools.value = response.tools;
    totalPages.value = Math.ceil(response.total / pageSize);
  } catch (error) {
    console.error('获取工具列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await toolsApi.getCategories();
    categories.value = response.categories;
  } catch (error) {
    console.error('获取分类列表失败:', error);
  }
};

// 计算过滤后的工具列表
const filteredTools = computed(() => {
  return tools.value;
});

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1;
  fetchTools();
};

// 处理筛选
const handleFilter = () => {
  currentPage.value = 1;
  fetchTools();
};

// 处理排序
const handleSort = () => {
  fetchTools();
};

// 处理分页
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchTools();
};

// 页面加载时获取数据
onMounted(() => {
  fetchCategories();
  fetchTools();
});
</script>

<style scoped>
.tools-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.tools-header {
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

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.tool-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s;
}

.tool-card:hover {
  transform: translateY(-4px);
}

.tool-icon {
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: #f5f5f5;
}

.tool-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tool-info {
  padding: 1.5rem;
}

.tool-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  color: #333;
}

.description {
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

.tool-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.category {
  background: #e8f0fe;
  color: #4a90e2;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
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

.visit-button {
  display: block;
  width: 100%;
  padding: 0.8rem;
  background: #4a90e2;
  color: white;
  text-align: center;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.visit-button:hover {
  background: #357abd;
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

@media (max-width: 768px) {
  .tools-page {
    padding: 1rem;
  }

  .filters {
    flex-direction: column;
  }

  .tools-grid {
    grid-template-columns: 1fr;
  }
}
</style> 