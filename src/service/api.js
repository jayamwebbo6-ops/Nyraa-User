// src/services/api.js - Wrapper
import { orderService } from './orderService.js'

export const orderAPI = {
  createOrder: orderService.createOrder,
  getUserOrders: orderService.getUserOrders,
  getOrder: orderService.getOrder,
  updateOrderStatus: orderService.updateOrderStatus,
  updatePaymentStatus: orderService.updatePaymentStatus,  // ✅ NEW
  getOrderStats: orderService.getOrderStats,
}
