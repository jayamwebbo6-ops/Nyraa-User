import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 🔹 Fetch profile thunk - Re-authenticates using token in localStorage
export const fetchProfile = createAsyncThunk(
    "auth/fetchProfile",
    async (_, thunkAPI) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return thunkAPI.rejectWithValue("No token");

            const res = await axios.get("http://localhost:5000/api/auth/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                return res.data.user;
            }
            return thunkAPI.rejectWithValue("Failed to fetch profile");
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || "Auth error");
        }
    }
);

const initialState = {
    token: localStorage.getItem("token") || null,
    user: null,
    isLoggedIn: !!localStorage.getItem("token"),
    isInitializing: !!localStorage.getItem("token"), // true if we have a token to verify
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.isLoggedIn = true;
            state.isInitializing = false;
            localStorage.setItem("token", action.payload.token);
            // ✅ We no longer store userData in localStorage for security
        },
        updateUser: (state, action) => {
            state.user = action.payload;
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.isLoggedIn = false;
            state.isInitializing = false;
            localStorage.removeItem("token");
            localStorage.removeItem("userData");
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isLoggedIn = true;
                state.isInitializing = false;
            })
            .addCase(fetchProfile.rejected, (state) => {
                state.token = null;
                state.user = null;
                state.isLoggedIn = false;
                state.isInitializing = false;
                localStorage.removeItem("token");
                localStorage.removeItem("userData");
            });
    },
});

export const { loginSuccess, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
