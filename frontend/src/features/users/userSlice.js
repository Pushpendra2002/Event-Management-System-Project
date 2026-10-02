import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userAPI } from '../../services/api';

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAPI.getUsers();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch users');
    }
  }
);

export const fetchUser = createAsyncThunk(
  'users/fetchUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await userAPI.getUser(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch user');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'users/updateUserProfile',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateUser(id, userData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await userAPI.deleteUser(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete user');
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    currentUser: null,
    loading: false,
    error: null
  },
  reducers: {
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    clearError: (state)  => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch User
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.currentUser = action.payload;
      })
      // Update User Profile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser?._id === action.payload._id) {
          state.currentUser = action.payload;
        }
      })
      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user._id !== action.payload);
      });
  }
});

export const { clearCurrentUser, clearError } = userSlice.actions;
export default userSlice.reducer;