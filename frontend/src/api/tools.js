import api from './index';

export const toolsApi = {
  // 获取工具列表
  getTools: async (params) => {
    return api.get('/tools', { params });
  },

  // 获取工具详情
  getToolById: async (id) => {
    return api.get(`/tools/${id}`);
  },

  // 添加工具（管理员）
  addTool: async (toolData) => {
    return api.post('/tools', toolData);
  },

  // 更新工具（管理员）
  updateTool: async (id, toolData) => {
    return api.put(`/tools/${id}`, toolData);
  },

  // 删除工具（管理员）
  deleteTool: async (id) => {
    return api.delete(`/tools/${id}`);
  },

  // 评分工具
  rateTool: async (id, rating) => {
    return api.post(`/tools/${id}/rate`, { rating });
  },

  // 获取工具分类列表
  getCategories: async () => {
    return api.get('/tools/categories');
  }
}; 