import http from './request'

export default {
  // 创建充值订单
  createRechargeOrder(data: {
    amount: number;
    type: 'normal' | 'llm';  // normal: 普通检测, llm: LLM检测
  }) {
    return http.post('/payment/create_order/', data)
  },

  // 获取支付宝支付链接
  getAlipayUrl(orderId: string) {
    return http.get(`/payment/alipay_url/${orderId}/`)
  },

  // 查询订单状态
  queryOrderStatus(orderId: string) {
    return http.get(`/payment/order_status/${orderId}/`)
  },

  // 获取组织检测次数信息
  getOrganizationQuota(organizationId: number) {
    return http.get(`/payment/organization_quota/${organizationId}/`)
  }
} 