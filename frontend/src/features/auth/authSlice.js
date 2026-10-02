import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';
import { setAuthToken } from '../../utils/auth';

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setAuthToken(token);
      }
      
      return { token, user, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 
        error.response?.data?.message || 
        'Registration failed'
      );
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setAuthToken(token);
      }
      
      return { token, user, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 
        error.response?.data?.message || 
        'Login failed'
      );
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuthToken(null);
      return { message: 'Logged out successfully' };
    } catch (error) {
      return rejectWithValue('Logout failed');
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getMe();
      return response.data.data;
    } catch (error) {
      return rejectWithValue('Failed to get user');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      await authAPI.forgotPassword(email);
      return 'Password reset email sent';
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to send reset email');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.resetPassword(token, password);
      const { token: newToken, user } = response.data;
      
      if (newToken) {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(user));
        setAuthToken(newToken);
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Password reset failed');
    }
  }
);

// ADD THIS - Missing updatePassword thunk
export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authAPI.updatePassword(currentPassword, newPassword);
      const { token, message } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
        setAuthToken(token);
      }
      
      return { token, message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 
        error.response?.data?.message || 
        'Failed to update password'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
    message: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.message = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    clearUser: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuthToken(null);
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.message = action.payload.message;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.message = action.payload.message;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.message = 'Logged out successfully';
      })
      // Get Me
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(getMe.rejected, (state) => {
        state.user = null;
        state.token = null;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reset Password
      .addCase(resetPassword.fulfilled, (state, action) => {
        if (action.payload.token) {
          state.token = action.payload.token;
          state.user = action.payload.user;
        }
        state.message = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Update Password - ADD THIS
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        if (action.payload.token) {
          state.token = action.payload.token;
          localStorage.setItem('token', action.payload.token);
        }
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;