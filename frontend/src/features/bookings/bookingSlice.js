import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingAPI } from '../../services/api';

// Async thunks
export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.createBooking(bookingData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create booking');
    }
  }
);

export const fetchBookings = createAsyncThunk(
  'bookings/fetchBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.getBookings();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch bookings');
    }
  }
);

export const fetchBooking = createAsyncThunk(
  'bookings/fetchBooking',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.getBooking(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch booking');
    }
  }
);

export const updatePaymentStatus = createAsyncThunk(
  'bookings/updatePaymentStatus',
  async ({ id, paymentData }, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.updatePaymentStatus(id, paymentData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update payment status');
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancelBooking',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.cancelBooking(id, reason);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to cancel booking');
    }
  }
);

export const checkIn = createAsyncThunk(
  'bookings/checkIn',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.checkIn(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to check in');
    }
  }
);

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    bookings: [],
    currentBooking: null,
    loading: false,
    error: null
  },
  reducers: {
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.unshift(action.payload);
        state.currentBooking = action.payload;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Bookings
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.bookings = action.payload;
      })
      // Fetch Booking
      .addCase(fetchBooking.fulfilled, (state, action) => {
        state.currentBooking = action.payload;
      })
      // Update Payment Status
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(booking => booking._id === action.payload._id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.currentBooking?._id === action.payload._id) {
          state.currentBooking = action.payload;
        }
      })
      // Cancel Booking
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(booking => booking._id === action.payload._id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.currentBooking?._id === action.payload._id) {
          state.currentBooking = action.payload;
        }
      });
  }
});

export const { clearCurrentBooking, clearError } = bookingSlice.actions;
export default bookingSlice.reducer;