import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import emergencyReducer from './emergencySlice';
import locationReducer from './locationSlice';
import responderReducer from './responderSlice';
import analyticsReducer from './analyticsSlice';
import broadcastReducer from './broadcastSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    emergency: emergencyReducer,
    location: locationReducer,
    responder: responderReducer,
    analytics: analyticsReducer,
    broadcast: broadcastReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;