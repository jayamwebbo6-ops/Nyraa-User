import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

const API_BASE_URL = "http://localhost:5000/api"

// ✅ ALL THUNKS
export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      })
      const data = await response.json()
      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to create order")
      }
      return data
    } catch (error) {
      return rejectWithValue(error.message || "Network error")
    }
  }
)

export const fetchUserOrders = createAsyncThunk(
  "orders/fetchUserOrders",
  async ({ page = 1, limit = 10, status } = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")
      let url = `${API_BASE_URL}/orders?page=${page}&limit=${limit}`
      if (status) url += `&status=${status}`
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch orders")
      }
      return data
    } catch (error) {
      return rejectWithValue(error.message || "Network error")
    }
  }
)

export const fetchOrder = createAsyncThunk("orders/fetchOrder", async (orderId, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await response.json()
    if (!response.ok) {
      return rejectWithValue(data.message || "Failed to fetch order")
    }
    return data.order
  } catch (error) {
    return rejectWithValue(error.message || "Network error")
  }
})

export const requestReturn = createAsyncThunk(
  "orders/requestReturn",
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")
      const orderId = formData.get("orderId");
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/return`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
      const data = await response.json()
      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to request return")
      }
      return { orderId: parseInt(orderId), status: "return_requested" }
    } catch (error) {
      return rejectWithValue(error.message || "Network error")
    }
  }
)

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    currentOrder: null,
    lastCreatedOrder: null,
    loading: false,
    error: null,
    pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
  },
  reducers: {
    clearError: (state) => { state.error = null },
    clearCurrentOrder: (state) => { state.currentOrder = null },
    clearLastCreatedOrder: (state) => { state.lastCreatedOrder = null },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload
      state.lastCreatedOrder = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order ✅ FIXED
      .addCase(createOrder.pending, (state) => {
        state.loading = true; state.error = null
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false; state.error = null
        const orderData = action.meta.arg
        const backendResponse = action.payload

        state.lastCreatedOrder = {
          id: backendResponse.orderId,
          orderNumber: `ORD-${backendResponse.orderId?.toString().padStart(4, '0')}`,
          items: orderData.items,
          subtotal: orderData.subtotal,
          shipping: orderData.shipping || '0.00',
          tax: orderData.tax,
          discount: orderData.discount || '0.00',
          total: orderData.total,
          shippingAddress: orderData.shippingAddress,
          paymentMethod: orderData.paymentMethod,
          specialInstructions: orderData.specialInstructions || '',
          status: 'pending'
        }
        state.currentOrder = state.lastCreatedOrder
        state.orders.unshift(state.lastCreatedOrder)
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false; state.error = action.payload
      })
      // Other cases unchanged...
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true; state.error = null
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload.orders
        state.pagination = action.payload.pagination
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false; state.error = action.payload
      })
      .addCase(fetchOrder.pending, (state) => {
        state.loading = true; state.error = null
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.loading = false
        state.currentOrder = action.payload
        state.lastCreatedOrder = action.payload
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.loading = false; state.error = action.payload
      })
      .addCase(requestReturn.pending, (state) => {
        state.loading = true; state.error = null
      })
      .addCase(requestReturn.fulfilled, (state, action) => {
        state.loading = false
        const { orderId, status } = action.payload
        const order = state.orders.find((o) => o.id === orderId)
        if (order) order.status = status
        if (state.currentOrder && state.currentOrder.id === orderId) {
          state.currentOrder.status = status
        }
      })
      .addCase(requestReturn.rejected, (state, action) => {
        state.loading = false; state.error = action.payload
      })
  },
})

export const { clearError, clearCurrentOrder, clearLastCreatedOrder, setCurrentOrder } = orderSlice.actions
export default orderSlice.reducer
