import request from '../utils/request';

// 创建支付订单
export const createOrder = (data) => {
  return request({
    url: '/api/payment/create-order',
    method: 'post',
    data
  });
};

// 查询支付状态
export const checkPaymentStatus = (orderId) => {
  return request({
    url: `/api/payment/status/${orderId}`,
    method: 'get'
  });
};

// 获取支付方式列表
export const getPaymentMethods = () => {
  return request({
    url: '/api/payment/methods',
    method: 'get'
  });
};

// 获取订单历史
export const getOrderHistory = (params) => {
  return request({
    url: '/api/payment/orders',
    method: 'get',
    params
  });
};

// 取消订单
export const cancelOrder = (orderId) => {
  return request({
    url: `/api/payment/cancel/${orderId}`,
    method: 'post'
  });
};

// 申请退款
export const requestRefund = (orderId, data) => {
  return request({
    url: `/api/payment/refund/${orderId}`,
    method: 'post',
    data
  });
}; 