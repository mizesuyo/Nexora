<template>
  <div class="payment-dialog">
    <div class="dialog-overlay" @click="handleClose">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3>支付</h3>
          <button class="close-button" @click="handleClose">&times;</button>
        </div>

        <div class="dialog-body">
          <!-- 订单信息 -->
          <div class="order-info">
            <h4>订单信息</h4>
            <div class="order-details">
              <p class="item-name">{{ orderInfo.title }}</p>
              <p class="item-price">¥{{ orderInfo.price.toFixed(2) }}</p>
            </div>
          </div>

          <!-- 支付方式选择 -->
          <div class="payment-methods" v-if="step === 'select'">
            <h4>选择支付方式</h4>
            <div class="methods-list">
              <div
                v-for="method in paymentMethods"
                :key="method.id"
                class="method-item"
                :class="{ active: selectedMethod === method.id }"
                @click="selectedMethod = method.id"
              >
                <img :src="method.icon" :alt="method.name" class="method-icon" />
                <span class="method-name">{{ method.name }}</span>
              </div>
            </div>
          </div>

          <!-- 支付二维码 -->
          <div class="payment-qrcode" v-if="step === 'pay'">
            <h4>请扫码支付</h4>
            <div class="qrcode-wrapper">
              <img :src="qrCodeUrl" alt="支付二维码" class="qrcode" />
            </div>
            <p class="payment-tip">请使用{{ getMethodName }}扫码支付</p>
            <div class="countdown">
              <span>二维码有效期还剩：</span>
              <span class="time">{{ formatCountdown }}</span>
            </div>
          </div>

          <!-- 支付结果 -->
          <div class="payment-result" v-if="step === 'result'">
            <div class="result-icon" :class="{ success: paymentSuccess }">
              <i class="icon" :class="paymentSuccess ? 'success' : 'fail"></i>
            </div>
            <h4>{{ paymentSuccess ? '支付成功' : '支付失败' }}</h4>
            <p class="result-message">
              {{ paymentSuccess ? '您已成功购买，可以开始使用了' : '支付遇到问题，请重试或选择其他支付方式' }}
            </p>
          </div>
        </div>

        <div class="dialog-footer">
          <!-- 选择支付方式步骤 -->
          <template v-if="step === 'select'">
            <button class="btn cancel" @click="handleClose">取消</button>
            <button 
              class="btn confirm" 
              @click="handleProceed"
              :disabled="!selectedMethod"
            >
              确认支付
            </button>
          </template>

          <!-- 扫码支付步骤 -->
          <template v-if="step === 'pay'">
            <button class="btn cancel" @click="handleBack">返回</button>
            <button class="btn" @click="refreshQRCode">刷新二维码</button>
          </template>

          <!-- 支付结果步骤 -->
          <template v-if="step === 'result'">
            <button 
              v-if="!paymentSuccess" 
              class="btn" 
              @click="handleRetry"
            >
              重试
            </button>
            <button 
              class="btn confirm" 
              @click="handleClose"
            >
              {{ paymentSuccess ? '完成' : '关闭' }}
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { paymentApi } from '../api/payment';

const props = defineProps({
  orderInfo: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'success']);

// 状态
const step = ref('select');
const selectedMethod = ref('');
const paymentMethods = ref([]);
const qrCodeUrl = ref('');
const countdown = ref(300); // 5分钟倒计时
const paymentSuccess = ref(false);
const currentOrderId = ref('');
const checkInterval = ref(null);

// 获取支付方式名称
const getMethodName = computed(() => {
  const method = paymentMethods.value.find(m => m.id === selectedMethod.value);
  return method ? method.name : '';
});

// 格式化倒计时
const formatCountdown = computed(() => {
  const minutes = Math.floor(countdown.value / 60);
  const seconds = countdown.value % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// 获取支付方式列表
const fetchPaymentMethods = async () => {
  try {
    const response = await paymentApi.getPaymentMethods();
    paymentMethods.value = response.methods;
  } catch (error) {
    console.error('获取支付方式失败:', error);
  }
};

// 创建支付订单
const createOrder = async () => {
  try {
    const response = await paymentApi.createOrder({
      itemId: props.orderInfo.id,
      itemType: props.orderInfo.type,
      paymentMethod: selectedMethod.value
    });
    currentOrderId.value = response.orderId;
    qrCodeUrl.value = response.qrCodeUrl;
    startPaymentCheck();
  } catch (error) {
    console.error('创建订单失败:', error);
  }
};

// 开始检查支付状态
const startPaymentCheck = () => {
  checkInterval.value = setInterval(async () => {
    try {
      const response = await paymentApi.checkPaymentStatus(currentOrderId.value);
      if (response.status === 'success') {
        paymentSuccess.value = true;
        step.value = 'result';
        clearInterval(checkInterval.value);
        emit('success');
      } else if (response.status === 'failed') {
        paymentSuccess.value = false;
        step.value = 'result';
        clearInterval(checkInterval.value);
      }
    } catch (error) {
      console.error('检查支付状态失败:', error);
    }
  }, 3000); // 每3秒检查一次
};

// 刷新二维码
const refreshQRCode = async () => {
  countdown.value = 300;
  await createOrder();
};

// 处理进入支付步骤
const handleProceed = async () => {
  step.value = 'pay';
  await createOrder();
};

// 处理返回选择支付方式
const handleBack = () => {
  clearInterval(checkInterval.value);
  step.value = 'select';
};

// 处理重试支付
const handleRetry = () => {
  step.value = 'select';
  selectedMethod.value = '';
};

// 处理关闭对话框
const handleClose = () => {
  clearInterval(checkInterval.value);
  emit('close');
};

// 倒计时处理
const startCountdown = () => {
  const timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(timer);
      // 二维码过期，需要刷新
      qrCodeUrl.value = '';
    }
  }, 1000);

  onUnmounted(() => {
    clearInterval(timer);
  });
};

onMounted(() => {
  fetchPaymentMethods();
  startCountdown();
});

onUnmounted(() => {
  if (checkInterval.value) {
    clearInterval(checkInterval.value);
  }
});
</script>

<style scoped>
.payment-dialog {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
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
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}

.dialog-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.dialog-body {
  padding: 1.5rem;
}

.order-info {
  margin-bottom: 1.5rem;
}

.order-info h4 {
  margin: 0 0 1rem 0;
  color: #333;
}

.order-details {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
}

.item-name {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.item-price {
  margin: 0;
  color: #4a90e2;
  font-size: 1.25rem;
  font-weight: 500;
}

.payment-methods h4 {
  margin: 0 0 1rem 0;
  color: #333;
}

.methods-list {
  display: grid;
  gap: 1rem;
}

.method-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.method-item:hover {
  border-color: #4a90e2;
}

.method-item.active {
  border-color: #4a90e2;
  background: #e8f0fe;
}

.method-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.method-name {
  color: #333;
}

.payment-qrcode {
  text-align: center;
}

.payment-qrcode h4 {
  margin: 0 0 1.5rem 0;
  color: #333;
}

.qrcode-wrapper {
  background: white;
  padding: 1rem;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 1rem;
}

.qrcode {
  width: 200px;
  height: 200px;
}

.payment-tip {
  color: #666;
  margin-bottom: 1rem;
}

.countdown {
  color: #666;
  font-size: 0.9rem;
}

.time {
  color: #4a90e2;
  font-weight: 500;
}

.payment-result {
  text-align: center;
  padding: 2rem 0;
}

.result-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-icon.success {
  background: #f6ffed;
  color: #52c41a;
}

.result-icon.fail {
  background: #fff2f0;
  color: #ff4d4f;
}

.result-icon .icon {
  font-size: 2rem;
}

.payment-result h4 {
  margin: 0 0 1rem 0;
  color: #333;
}

.result-message {
  color: #666;
  margin: 0;
}

.dialog-footer {
  padding: 1.5rem;
  border-top: 1px solid #eee;
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

.btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .dialog {
    width: 100%;
    height: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .qrcode {
    width: 160px;
    height: 160px;
  }
}
</style> 