import axios from 'axios';

// 从环境变量获取API基础URL，如果未设置则使用默认值
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * 创建axios实例
 * 配置基本的请求参数：
 * - baseURL: API的基础URL
 * - timeout: 请求超时时间（毫秒）
 * - headers: 默认请求头
 */
const api = axios.create({
  baseURL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * 请求拦截器
 * 在发送请求之前做一些处理：
 * 1. 检查是否有token
 * 2. 如果有token，将其添加到请求头中
 */
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 * 处理服务器返回的响应：
 * 1. 成功响应：直接返回数据部分
 * 2. 错误响应：根据不同的错误状态码进行相应处理
 */
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response) {
      // 服务器返回了错误状态码
      switch (error.response.status) {
        case 401:
          // 未授权：token过期或无效
          // 清除本地token并重定向到登录页
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // 权限不足：用户没有执行该操作的权限
          console.error('没有权限执行此操作');
          break;
        case 404:
          // 资源不存在：请求的API端点或资源不存在
          console.error('请求的资源不存在');
          break;
        case 500:
          // 服务器错误：后端程序发生异常
          console.error('服务器错误');
          break;
        default:
          // 其他错误状态码
          console.error('发生错误:', error.response.data.message);
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      // 可能是网络问题或服务器没有运行
      console.error('无法连接到服务器');
    } else {
      // 请求配置有误
      // 可能是请求参数格式错误
      console.error('请求配置错误:', error.message);
    }
    return Promise.reject(error);
  }
);

/*
这个文件的作用：
1. 创建和配置axios实例
2. 统一处理API请求和响应
3. 处理认证token
4. 统一的错误处理机制

为什么要这样写：
1. 集中管理API配置，便于维护
2. 统一的错误处理，提供一致的用户体验
3. 自动处理token认证
4. 优雅的错误提示和处理机制

与其他文件的关系：
1. 被其他API模块（auth.js, tools.js等）使用
2. 与用户认证状态管理相关
3. 与路由系统配合处理认证失效
4. 为整个应用提供统一的API调用接口

举例说明：
想象这个文件就像一个邮局的总服务台：
- axios实例就像是邮局的基础设施
- 请求拦截器就像是寄信前的信封检查
- 响应拦截器就像是收信时的分拣处理
- 错误处理就像是处理投递异常的标准流程
*/

// 导出配置好的axios实例
export default api; 