import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import eventReducer from '../features/events/eventSlice';
import bookingReducer from '../features/bookings/bookingSlice';
import userReducer from '../features/users/userSlice';
import notificationReducer from '../features/notifications/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventReducer,
    bookings: bookingReducer,
    users: userReducer,
    notifications: notificationReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    }),
  devTools: process.env.NODE_ENV !== 'production'
});