import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Hazard {
  id: string;
  type: string;
  description: string;
  latitude: number;
  longitude: number;
  status: string;
  createdAt: string;
}

interface HazardState {
  hazards: Hazard[];
}

const initialState: HazardState = {
  hazards: [],
};

const hazardSlice = createSlice({
  name: 'hazard',
  initialState,
  reducers: {
    setHazards: (state, action: PayloadAction<Hazard[]>) => {
      state.hazards = action.payload;
    },
    addHazard: (state, action: PayloadAction<Hazard>) => {
      state.hazards.push(action.payload);
    },
  },
});

export const { setHazards, addHazard } = hazardSlice.actions;
export default hazardSlice.reducer;