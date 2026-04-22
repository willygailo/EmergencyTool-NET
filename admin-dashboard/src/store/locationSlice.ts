import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Location } from '../shared/types/location.types';

interface LocationState {
  locations: Location[];
  loading: boolean;
}

const initialState: LocationState = {
  locations: [],
  loading: false,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocations: (state, action: PayloadAction<Location[]>) => {
      state.locations = action.payload;
    },
    updateLocation: (state, action: PayloadAction<Location>) => {
      const index = state.locations.findIndex((l) => l.id === action.payload.id);
      if (index !== -1) {
        state.locations[index] = action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setLocations, updateLocation, setLoading } = locationSlice.actions;
export default locationSlice.reducer;