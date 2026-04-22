import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  assignments: [],
  currentAssignment: null,
};

const responderSlice = createSlice({
  name: 'responder',
  initialState,
  reducers: {
    setAssignments: (state, action) => {
      state.assignments = action.payload;
    },
    setCurrentAssignment: (state, action) => {
      state.currentAssignment = action.payload;
    },
  },
});

export const { setAssignments, setCurrentAssignment } = responderSlice.actions;
export default responderSlice.reducer;