// Your complete orderService.js with updatePaymentStatus added
import axios from "axios"

const API_BASE_URL = "http://localhost:5000/api"
const getAuthToken = () => localStorage.getItem("token")
const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: getAuthToken() ? `Bearer ${getAuthToken()}` : "",
})

export const orderService = {
  // ... your existing functions ...
  
  // ✅ ADD THIS AT END (before final })
  updatePaymentStatus: async (orderId, paymentStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/payment-status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ paymentStatus }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || "Failed to update payment status")
      return result
    } catch (error) {
      console.error("Update payment status error:", error)
      throw error
    }
  }
}
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, thunkAPI) => {
    try {
      const res = await axios.post('/api/orders', orderData);

      // ✅ THIS LINE IS THE FIX
      return res.data;

    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Order creation failed'
      );
    }
  }
);
