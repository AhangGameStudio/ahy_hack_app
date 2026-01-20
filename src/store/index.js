import { configureStore } from '@reduxjs/toolkit';
import deviceReducer from './deviceSlice';

export const store = configureStore({
  reducer: {
    device: deviceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['device/setActiveDevice'],
        // Ignore these paths in the state
        ignoredPaths: ['device.activeDevice'],
      },
    }),
});