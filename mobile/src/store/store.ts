import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import locationReducer from './locationSlice';
import emergencyReducer from './emergencySlice';
import familyReducer from './familySlice';
import hazardReducer from './hazardSlice';
import responderReducer from './responderSlice';
import offlineReducer from './offlineSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    location: locationReducer,
    emergency: emergencyReducer,
    family: familyReducer,
    hazard: hazardReducer,
    responder: responderReducer,
    offline: offlineReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;