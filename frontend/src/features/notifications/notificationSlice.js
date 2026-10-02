import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationAPI } from '../../services/api';

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.getNotifications();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch notifications');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      await notificationAPI.markAsRead(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to mark as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationAPI.markAllAsRead();
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to mark all as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (id, { rejectWithValue }) => {
    try {
      await notificationAPI.deleteNotification(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete notification');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    loading: false,
    error: null,
    unreadCount: 0
  },
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.read).length;
      })
      // Mark as Read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n._id === action.payload);
        if (notification) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Mark All as Read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => n.read = true);
        state.unreadCount = 0;
      })
      // Delete Notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n._id === action.payload);
        if (notification && !notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(n => n._id !== action.payload);
      });
  }
});

export const { addNotification, clearError } = notificationSlice.actions;
export default notificationSlice.reducer;