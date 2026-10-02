import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { eventAPI } from '../../services/api';

// Async thunks
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (params, { rejectWithValue }) => {
    try {
      console.log("params1:",params);
      const response = await eventAPI.getEvents(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch events');
    }
  }
);

export const fetchEvent = createAsyncThunk(
  'events/fetchEvent',
  async (id, { rejectWithValue }) => {
    try {
      const response = await eventAPI.getEvent(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch event');
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await eventAPI.createEvent(eventData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create event');
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ id, eventData }, { rejectWithValue }) => {
    try {
      const response = await eventAPI.updateEvent(id, eventData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update event');
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (id, { rejectWithValue }) => {
    try {
      await eventAPI.deleteEvent(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete event');
    }
  }
);

export const uploadEventImage = createAsyncThunk(
  'events/uploadEventImage',
  async ({ id, image }, { rejectWithValue }) => {
    try {
      const response = await eventAPI.uploadEventImage(id, image);
      return { id, image: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to upload image');
    }
  }
);

export const fetchFeaturedEvents = createAsyncThunk(
  'events/fetchFeaturedEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await eventAPI.getFeaturedEvents();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch featured events');
    }
  }
);

export const fetchMyEvents = createAsyncThunk(
  'events/fetchMyEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await eventAPI.getMyEvents();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch your events');
    }
  }
);

export const updateEventStatus = createAsyncThunk(
  'events/updateEventStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await eventAPI.updateEvent(id, { status });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to update event status'
      );
    }
  }
);


const eventSlice = createSlice({
  name: 'events',
  initialState: {
    events: [],
    featuredEvents: [],
    myEvents: [],
    currentEvent: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      totalPages: 1,
      total: 0
    }
  },
  reducers: {
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Events
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload.data;
        state.pagination = {
          page: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.total
        };
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Event
      .addCase(fetchEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEvent = action.payload;
      })
      .addCase(fetchEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Event
      .addCase(createEvent.fulfilled, (state, action) => {
        state.myEvents.unshift(action.payload);
      })
      // Update Event
      .addCase(updateEvent.fulfilled, (state, action) => {
        const index = state.myEvents.findIndex(event => event._id === action.payload._id);
        if (index !== -1) {
          state.myEvents[index] = action.payload;
        }
        if (state.currentEvent?._id === action.payload._id) {
          state.currentEvent = action.payload;
        }
      })
      // Delete Event
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.myEvents = state.myEvents.filter(event => event._id !== action.payload);
      })
      // Fetch Featured Events
      .addCase(fetchFeaturedEvents.fulfilled, (state, action) => {
        state.featuredEvents = action.payload;
      })
      // Fetch My Events
      .addCase(fetchMyEvents.fulfilled, (state, action) => {
        state.myEvents = action.payload;
      })
      // Admin: Update Event Status
      .addCase(updateEventStatus.fulfilled, (state, action) => {
        // Update in events list (Admin Dashboard)
        const index = state.events.findIndex(
          event => event._id === action.payload._id
        );
        if (index !== -1) {
          state.events[index] = action.payload;
        }

        // Update current event if open
        if (state.currentEvent?._id === action.payload._id) {
          state.currentEvent = action.payload;
        }
      })
      ;
        }
      });

export const { clearCurrentEvent, clearError } = eventSlice.actions;
export default eventSlice.reducer;