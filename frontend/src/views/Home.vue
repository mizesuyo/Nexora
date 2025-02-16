<template>
  <div class="home">
    <section class="hero">
      <div class="hero-content">
        <h1>发现最佳 AI 工具和提示词</h1>
        <p>探索、分享和交易高质量的 AI 提示词，发现最新最热门的 AI 工具</p>
        <div class="hero-buttons">
          <router-link to="/tools" class="btn primary">浏览 AI 工具</router-link>
          <router-link to="/prompts" class="btn secondary">进入提示词市场</router-link>
        </div>
      </div>
    </section>

    <section class="featured-tools">
      <h2>热门 AI 工具</h2>
      <div class="tools-grid">
        <div v-for="tool in featuredTools" :key="tool.id" class="tool-card">
          <img :src="tool.icon" :alt="tool.name" class="tool-icon">
          <h3>{{ tool.name }}</h3>
          <p>{{ tool.description }}</p>
          <div class="tool-footer">
            <span class="category">{{ tool.category }}</span>
            <span class="rating">⭐ {{ tool.rating.toFixed(1) }}</span>
          </div>
        </div>
      </div>
      <div class="view-more">
        <router-link to="/tools" class="btn outline">查看更多工具</router-link>
      </div>
    </section>

    <section class="featured-prompts">
      <h2>精选提示词</h2>
      <div class="prompts-grid">
        <div v-for="prompt in featuredPrompts" :key="prompt.id" class="prompt-card">
          <div class="prompt-header">
            <h3>{{ prompt.title }}</h3>
            <span class="price">¥{{ prompt.price.toFixed(2) }}</span>
          </div>
          <p class="preview">{{ prompt.preview }}</p>
          <div class="prompt-footer">
            <span class="category">{{ prompt.category }}</span>
            <span class="rating">⭐ {{ prompt.rating.toFixed(1) }}</span>
          </div>
        </div>
      </div>
      <div class="view-more">
        <router-link to="/prompts" class="btn outline">浏览更多提示词</router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { toolsApi } from '../api/tools';
import { promptsApi } from '../api/prompts';

const featuredTools = ref([]);
const featuredPrompts = ref([]);

const fetchFeaturedContent = async () => {
  try {
    // 获取热门工具
    const toolsResponse = await toolsApi.getTools({ 
      sort: '-rating',
      limit: 6 
    });
    featuredTools.value = toolsResponse.tools;

    // 获取精选提示词
    const promptsResponse = await promptsApi.getPrompts({ 
      sort: '-rating',
      limit: 6 
    });
    featuredPrompts.value = promptsResponse.prompts;
  } catch (error) {
    console.error('获取首页内容失败:', error);
  }
};

onMounted(() => {
  fetchFeaturedContent();
});
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  border-radius: 12px;
  color: white;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.btn.primary {
  background-color: white;
  color: #4a90e2;
}

.btn.primary:hover {
  background-color: #f5f5f5;
}

.btn.secondary {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.btn.secondary:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.btn.outline {
  border: 1px solid #4a90e2;
  color: #4a90e2;
}

.btn.outline:hover {
  background-color: #4a90e2;
  color: white;
}

section {
  margin-bottom: 3rem;
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #333;
}

.tools-grid,
.prompts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.tool-card,
.prompt-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.tool-card:hover,
.prompt-card:hover {
  transform: translateY(-4px);
}

.tool-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
}

h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.tool-footer,
.prompt-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.category {
  background-color: #f0f0f0;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #666;
}

.rating {
  color: #ffa500;
  font-size: 0.9rem;
}

.prompt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.price {
  color: #4a90e2;
  font-weight: 500;
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

.view-more {
  text-align: center;
}

@media (max-width: 768px) {
  .hero {
    padding: 3rem 1rem;
  }

  .hero h1 {
    font-size: 2rem;
  }

  .hero p {
    font-size: 1rem;
  }

  .hero-buttons {
    flex-direction: column;
  }

  .tools-grid,
  .prompts-grid {
    grid-template-columns: 1fr;
  }
}
</style> 