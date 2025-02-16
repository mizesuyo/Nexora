<template>
  <div class="prompt-detail">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="prompt" class="prompt-content">
      <div class="prompt-header">
        <div class="prompt-basic-info">
          <h1>{{ prompt.title }}</h1>
          <div class="prompt-meta">
            <span class="category">{{ prompt.category }}</span>
            <div class="rating">
              <span class="stars">⭐</span>
              <span>{{ prompt.rating.toFixed(1) }}</span>
              <span class="count">({{ prompt.ratingCount }})</span>
            </div>
            <span class="purchase-count">{{ prompt.purchaseCount }} 次购买</span>
          </div>
        </div>
        <div class="price-section">
          <div class="price">¥{{ prompt.price.toFixed(2) }}</div>
          <button 
            v-if="!isPurchased && !isAuthor" 
            class="purchase-button"
            @click="showPurchaseConfirm = true"
            :disabled="!userStore.isLoggedIn"
          >
            {{ userStore.isLoggedIn ? '购买' : '登录后购买' }}
          </button>
          <span v-else-if="isPurchased" class="purchased-badge">已购买</span>
          <span v-else class="author-badge">我的创作</span>
        </div>
      </div>

      <div class="prompt-body">
        <div class="preview">
          <h2>预览内容</h2>
          <p>{{ prompt.preview }}</p>
        </div>

        <div v-if="isPurchased || isAuthor" class="full-content">
          <h2>完整内容</h2>
          <div class="content-box">
            {{ prompt.content }}
            <button class="copy-button" @click="copyContent">
              复制内容
            </button>
          </div>
        </div>

        <div class="tags">
          <h2>标签</h2>
          <div class="tag-list">
            <span v-for="tag in prompt.tags" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>
        </div>

        <div class="author-info">
          <h2>作者信息</h2>
          <div class="author">
            <img :src="prompt.author.avatar" :alt="prompt.author.username" class="author-avatar" />
            <div class="author-details">
              <h3>{{ prompt.author.username }}</h3>
              <p>创建于 {{ formatDate(prompt.createdAt) }}</p>
            </div>
          </div>
        </div>

        <div class="rating-section" v-if="isPurchased && !isAuthor">
          <h2>评分</h2>
          <div class="rate-prompt">
            <div class="stars-input">
              <span
                v-for="n in 5"
                :key="n"
                class="star"
                :class="{ active: n <= hoverRating || n <= userRating }"
                @mouseover="hoverRating = n"
                @mouseleave="hoverRating = 0"
                @click="ratePrompt(n)"
              >
                ⭐
              </span>
            </div>
            <p class="rating-hint">{{ ratingHint }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="error-message">
      <p>{{ error || '提示词不存在' }}</p>
      <router-link to="/prompts" class="back-button">返回提示词市场</router-link>
    </div>

    <!-- 购买确认对话框 -->
    <div v-if="showPurchaseConfirm" class="dialog-overlay" @click="showPurchaseConfirm = false">
      <div class="dialog" @click.stop>
        <h3>确认购买</h3>
        <div class="purchase-info">
          <p class="prompt-title">{{ prompt.title }}</p>
          <p class="purchase-price">价格：¥{{ prompt.price.toFixed(2) }}</p>
        </div>
        <p class="purchase-notice">购买后可查看完整内容并获得永久使用权</p>
        <div class="dialog-actions">
          <button class="btn cancel" @click="showPurchaseConfirm = false">
            取消
          </button>
          <button 
            class="btn confirm" 
            @click="handlePurchase"
            :disabled="purchasing"
          >
            {{ purchasing ? '购买中...' : '确认购买' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { promptsApi } from '../api/prompts';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const prompt = ref(null);
const loading = ref(true);
const error = ref('');
const userRating = ref(0);
const hoverRating = ref(0);
const showPurchaseConfirm = ref(false);
const purchasing = ref(false);

const isPurchased = computed(() => {
  if (!prompt.value || !userStore.isLoggedIn) return false;
  return prompt.value.purchasedBy?.includes(userStore.user.id);
});

const isAuthor = computed(() => {
  if (!prompt.value || !userStore.isLoggedIn) return false;
  return prompt.value.author.id === userStore.user.id;
});

const ratingHint = computed(() => {
  const ratings = ['很差', '一般', '还行', '不错', '很棒'];
  return hoverRating.value ? ratings[hoverRating.value - 1] : '点击星星评分';
});

const fetchPromptDetails = async () => {
  try {
    loading.value = true;
    const response = await promptsApi.getPromptById(route.params.id);
    prompt.value = response;
    if (response.userRating) {
      userRating.value = response.userRating;
    }
  } catch (err) {
    error.value = err.response?.data?.message || '获取提示词详情失败';
  } finally {
    loading.value = false;
  }
};

const handlePurchase = async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login');
    return;
  }

  try {
    purchasing.value = true;
    const response = await promptsApi.purchasePrompt(prompt.value.id);
    prompt.value = response.prompt;
    showPurchaseConfirm.value = false;
  } catch (err) {
    console.error('购买失败:', err);
  } finally {
    purchasing.value = false;
  }
};

const ratePrompt = async (rating) => {
  try {
    const response = await promptsApi.ratePrompt(prompt.value.id, rating);
    prompt.value = response.prompt;
    userRating.value = rating;
  } catch (err) {
    console.error('评分失败:', err);
  }
};

const copyContent = () => {
  navigator.clipboard.writeText(prompt.value.content)
    .then(() => {
      // 可以添加一个提示，表示复制成功
    })
    .catch(err => {
      console.error('复制失败:', err);
    });
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

onMounted(() => {
  fetchPromptDetails();
});
</script>

<style scoped>
.prompt-detail {
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

.prompt-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.prompt-basic-info h1 {
  margin: 0 0 1rem 0;
  font-size: 2rem;
  color: #333;
}

.prompt-meta {
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

.purchase-count {
  color: #666;
  font-size: 0.9rem;
}

.price-section {
  text-align: right;
}

.price {
  font-size: 2rem;
  color: #4a90e2;
  font-weight: bold;
  margin-bottom: 1rem;
}

.purchase-button {
  background: #4a90e2;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.purchase-button:hover:not(:disabled) {
  background: #357abd;
}

.purchase-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.purchased-badge,
.author-badge {
  display: inline-block;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
}

.purchased-badge {
  background: #52c41a;
  color: white;
}

.author-badge {
  background: #faad14;
  color: white;
}

.prompt-body {
  display: grid;
  gap: 2rem;
}

.preview h2,
.full-content h2,
.tags h2,
.author-info h2,
.rating-section h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: #333;
}

.preview p,
.content-box {
  color: #666;
  line-height: 1.6;
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  position: relative;
}

.content-box {
  white-space: pre-wrap;
}

.copy-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: white;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-button:hover {
  background: #4a90e2;
  color: white;
  border-color: #4a90e2;
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

.author {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.author-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}

.author-details h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.author-details p {
  color: #666;
  font-size: 0.9rem;
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

.dialog h3 {
  margin: 0 0 1.5rem 0;
  color: #333;
}

.purchase-info {
  margin-bottom: 1.5rem;
}

.prompt-title {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.purchase-price {
  color: #4a90e2;
  font-size: 1.5rem;
  font-weight: bold;
}

.purchase-notice {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
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

.btn.confirm:disabled {
  background: #ccc;
  cursor: not-allowed;
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
  .prompt-detail {
    padding: 1rem;
  }

  .prompt-header {
    flex-direction: column;
    gap: 1.5rem;
  }

  .prompt-basic-info h1 {
    font-size: 1.5rem;
  }

  .prompt-meta {
    flex-wrap: wrap;
  }

  .price-section {
    text-align: left;
  }

  .price {
    font-size: 1.5rem;
  }

  .author {
    flex-direction: column;
    text-align: center;
  }
}
</style> 