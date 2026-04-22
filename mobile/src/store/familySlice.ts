import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  members: [],
  checkInStatus: 'pending',
};

const familySlice = createSlice({
  name: 'family',
  initialState,
  reducers: {
    setFamilyMembers: (state, action) => {
      state.members = action.payload;
    },
    setCheckInStatus: (state, action) => {
      state.checkInStatus = action.payload;
    },
  },
});

export const { setFamilyMembers, setCheckInStatus } = familySlice.actions;
export default familySlice.reducer;