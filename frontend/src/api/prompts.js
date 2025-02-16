import request from '../utils/request';

export const promptsApi = {
  // 获取提示词列表
  getPrompts: (params) => {
    return request({
      url: '/api/prompts',
      method: 'get',
      params
    });
  },

  // 获取提示词分类
  getCategories: () => {
    return request({
      url: '/api/prompts/categories',
      method: 'get'
    });
  },

  // 获取提示词详情
  getPromptById: (id) => {
    return request({
      url: `/api/prompts/${id}`,
      method: 'get'
    });
  },

  // 创建提示词
  createPrompt: async (promptData) => {
    return request({
      url: '/api/prompts',
      method: 'post',
      data: promptData
    });
  },

  // 更新提示词
  updatePrompt: async (id, promptData) => {
    return request({
      url: `/api/prompts/${id}`,
      method: 'put',
      data: promptData
    });
  },

  // 删除提示词
  deletePrompt: async (id) => {
    return request({
      url: `/api/prompts/${id}`,
      method: 'delete'
    });
  },

  // 购买提示词
  purchasePrompt: (id) => {
    return request({
      url: `/api/prompts/${id}/purchase`,
      method: 'post'
    });
  },

  // 获取已购买的提示词
  getPurchasedPrompts: () => {
    return request({
      url: '/api/prompts/purchased',
      method: 'get'
    });
  },

  // 获取我创建的提示词
  getMyPrompts: async () => {
    return request({
      url: '/api/prompts/my',
      method: 'get'
    });
  },

  // 评分提示词
  ratePrompt: (id, rating) => {
    return request({
      url: `/api/prompts/${id}/rate`,
      method: 'post',
      data: { rating }
    });
  }
}; 