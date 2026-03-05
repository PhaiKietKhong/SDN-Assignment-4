import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const tokenFromStorage = localStorage.getItem("token");
const usernameFromStorage = localStorage.getItem("username");

const initialState = {
  token: tokenFromStorage || null,
  username: usernameFromStorage || "",
  isAuthenticated: Boolean(tokenFromStorage),
  loading: false,
  error: "",
  successMessage: "",
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const trimmedUsername = username.trim();
      const { data } = await axios.post("/api/users/login", {
        username: trimmedUsername,
        password,
      });

      if (!data?.success || !data?.token) {
        return rejectWithValue(data?.message || "Đăng nhập thất bại");
      }

      return {
        token: data.token,
        username: trimmedUsername,
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể kết nối server",
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthMessages: (state) => {
      state.error = "";
      state.successMessage = "";
    },
    logout: (state) => {
      state.token = null;
      state.username = "";
      state.isAuthenticated = false;
      state.loading = false;
      state.error = "";
      state.successMessage = "";
      localStorage.removeItem("token");
      localStorage.removeItem("username");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = "";
        state.successMessage = "";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.username = action.payload.username;
        state.isAuthenticated = true;
        state.successMessage = "Đăng nhập thành công";
        state.error = "";
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("username", action.payload.username);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đăng nhập thất bại";
        state.successMessage = "";
      });
  },
});

export const { clearAuthMessages, logout } = authSlice.actions;

export default authSlice.reducer;
