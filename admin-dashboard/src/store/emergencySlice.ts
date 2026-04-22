import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Emergency } from '../shared/types/emergency.types';

interface EmergencyState {
  emergencies: Emergency[];
  selectedEmergency: Emergency | null;
  loading: boolean;
  error: string | null;
}

const initialState: EmergencyState = {
  emergencies: [],
  selectedEmergency: null,
  loading: false,
  error: null,
};

const emergencySlice = createSlice({
  name: 'emergency',
  initialState,
  reducers: {
    setEmergencies: (state, action: PayloadAction<Emergency[]>) => {
      state.emergencies = action.payload;
    },
    addEmergency: (state, action: PayloadAction<Emergency>) => {
      state.emergencies.unshift(action.payload);
    },
    updateEmergency: (state, action: PayloadAction<Emergency>) => {
      const index = state.emergencies.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.emergencies[index] = action.payload;
      }
    },
    selectEmergency: (state, action: PayloadAction<Emergency | null>) => {
      state.selectedEmergency = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setEmergencies, addEmergency, updateEmergency, selectEmergency, setLoading, setError } = emergencySlice.actions;
export default emergencySlice.reducer;