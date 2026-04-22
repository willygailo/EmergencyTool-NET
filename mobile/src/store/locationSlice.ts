import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LocationState {
  currentLocation: { latitude: number; longitude: number; accuracy: number } | null;
  locationHistory: any[];
  sharingEnabled: boolean;
}

const initialState: LocationState = {
  currentLocation: null,
  locationHistory: [],
  sharingEnabled: false,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setCurrentLocation: (state, action: PayloadAction<{ latitude: number; longitude: number; accuracy: number }>) => {
      state.currentLocation = action.payload;
      state.locationHistory.push({ ...action.payload, timestamp: new Date().toISOString() });
    },
    setSharingEnabled: (state, action: PayloadAction<boolean>) => {
      state.sharingEnabled = action.payload;
    },
    clearLocationHistory: (state) => {
      state.locationHistory = [];
    },
  },
});

export const { setCurrentLocation, setSharingEnabled, clearLocationHistory } = locationSlice.actions;
export default locationSlice.reducer;