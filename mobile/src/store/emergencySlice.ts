import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {};

const emergencySlice = createSlice({
  name: 'emergency',
  initialState,
  reducers: {
    setActiveEmergency: (state, action: PayloadAction<any>) => state,
    clearEmergency: () => initialState,
  },
});

export const { setActiveEmergency, clearEmergency } = emergencySlice.actions;
export default emergencySlice.reducer;