import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../apiClient";

const initialState = {
  quizzes: [],
  selectedQuiz: null,
  questions: [],
  loading: false,
  error: "",
};

export const fetchQuizzes = createAsyncThunk(
  "quiz/fetchQuizzes",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const { data } = await apiClient.get("/quizzes", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch quizzes",
      );
    }
  },
);

export const fetchQuizById = createAsyncThunk(
  "quiz/fetchQuizById",
  async (quizId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const { data } = await apiClient.get(`/quizzes/${quizId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch quiz",
      );
    }
  },
);

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    clearQuizState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzes.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = action.payload;
        state.selectedQuiz = null;
        state.questions = [];
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch quizzes";
      })
      .addCase(fetchQuizById.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedQuiz = action.payload;
        state.questions = action.payload.question || [];
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch quiz";
      });
  },
});

export const { clearQuizState } = quizSlice.actions;

export default quizSlice.reducer;
