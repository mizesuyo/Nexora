<template>
  <div class="tool-detail">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="tool" class="tool-content">
      <div class="tool-header">
        <div class="tool-basic-info">
          <img :src="tool.icon" :alt="tool.name" class="tool-icon" />
          <div class="tool-title">
            <h1>{{ tool.name }}</h1>
            <div class="tool-meta">
              <span class="category">{{ tool.category }}</span>
              <div class="rating">
                <span class="stars">⭐</span>
                <span>{{ tool.rating.toFixed(1) }}</span>
                <span class="count">({{ tool.ratingCount }})</span>
              </div>
            </div>
          </div>
        </div>
        <a :href="tool.url" target="_blank" class="visit-button">访问工具</a>
      </div>

      <div class="tool-body">
        <div class="description">
          <h2>工具描述</h2>
          <p>{{ tool.description }}</p>
        </div>

        <div class="tags">
          <h2>标签</h2>
          <div class="tag-list">
            <span v-for="tag in tool.tags" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>
        </div>

        <div class="rating-section" v-if="userStore.isLoggedIn">
          <h2>评分</h2>
          <div class="rate-tool">
            <div class="stars-input">
              <span
                v-for="n in 5"
                :key="n"
                class="star"
                :class="{ active: n <= hoverRating || n <= userRating }"
                @mouseover="hoverRating = n"
                @mouseleave="hoverRating = 0"
                @click="rateTool(n)"
              >
                ⭐
              </span>
            </div>
            <p class="rating-hint">{{ ratingHint }}</p>
          </div>
        </div>
      </div>

      <div class="related-tools" v-if="relatedTools.length">
        <h2>相关工具</h2>
        <div class="tools-grid">
          <div v-for="relatedTool in relatedTools" :key="relatedTool.id" class="tool-card">
            <img :src="relatedTool.icon" :alt="relatedTool.name" class="tool-icon" />
            <div class="tool-info">
              <h3>{{ relatedTool.name }}</h3>
              <p>{{ relatedTool.description }}</p>
              <div class="tool-footer">
                <span class="category">{{ relatedTool.category }}</span>
                <div class="rating">
                  <span class="stars">⭐</span>
                  <span>{{ relatedTool.rating.toFixed(1) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="error-message">
      <p>{{ error || '工具不存在' }}</p>
      <router-link to="/tools" class="back-button">返回工具列表</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { toolsApi } from '../api/tools';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const tool = ref(null);
const loading = ref(true);
const error = ref('');
const relatedTools = ref([]);
const userRating = ref(0);
const hoverRating = ref(0);

const ratingHint = computed(() => {
  const ratings = ['很差', '一般', '还行', '不错', '很棒'];
  return hoverRating.value ? ratings[hoverRating.value - 1] : '点击星星评分';
});

const fetchToolDetails = async () => {
  try {
    loading.value = true;
    const response = await toolsApi.getToolById(route.params.id);
    tool.value = response;
    fetchRelatedTools();
  } catch (err) {
    error.value = err.response?.data?.message || '获取工具详情失败';
  } finally {
    loading.value = false;
  }
};

const fetchRelatedTools = async () => {
  try {
    const response = await toolsApi.getTools({
      category: tool.value.category,
      limit: 3,
      exclude: tool.value.id
    });
    relatedTools.value = response.tools;
  } catch (err) {
    console.error('获取相关工具失败:', err);
  }
};

const rateTool = async (rating) => {
  if (!userStore.isLoggedIn) {
    router.push('/login');
    return;
  }

  try {
    const response = await toolsApi.rateTool(tool.value.id, rating);
    tool.value = response.tool;
    userRating.value = rating;
  } catch (err) {
    console.error('评分失败:', err);
  }
};

onMounted(() => {
  fetchToolDetails();
});
</script>

<style scoped>
.tool-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
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

.tool-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.tool-basic-info {
  display: flex;
  gap: 2rem;
}

.tool-icon {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.tool-title h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  color: #333;
}

.tool-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.category {
  background: #e8f0fe;
  color: #4a90e2;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #666;
}

.stars {
  color: #ffd700;
}

.count {
  color: #999;
  font-size: 0.9rem;
}

.visit-button {
  background: #4a90e2;
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.2s;
}

.visit-button:hover {
  background: #357abd;
}

.tool-body {
  display: grid;
  gap: 2rem;
  margin-bottom: 3rem;
}

.description h2,
.tags h2,
.rating-section h2,
.related-tools h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: #333;
}

.description p {
  color: #666;
  line-height: 1.6;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: #f0f0f0;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #666;
}

.rating-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.stars-input {
  display: flex;
  gap: 0.5rem;
}

.star {
  cursor: pointer;
  font-size: 1.5rem;
  color: #ddd;
  transition: color 0.2s;
}

.star.active {
  color: #ffd700;
}

.rating-hint {
  margin-top: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.related-tools .tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
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

.error-message {
  text-align: center;
  padding: 3rem;
}

.back-button {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.8rem 1.5rem;
  background: #4a90e2;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.back-button:hover {
  background: #357abd;
}

@media (max-width: 768px) {
  .tool-detail {
    padding: 1rem;
  }

  .tool-header {
    flex-direction: column;
    gap: 1rem;
  }

  .tool-basic-info {
    flex-direction: column;
    gap: 1rem;
  }

  .tool-icon {
    width: 80px;
    height: 80px;
  }

  .tool-title h1 {
    font-size: 1.5rem;
  }

  .related-tools .tools-grid {
    grid-template-columns: 1fr;
  }
}
</style> 