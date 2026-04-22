import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Broadcast } from '../shared/types/api.types';

interface BroadcastState {
  broadcasts: Broadcast[];
  loading: boolean;
}

const initialState: BroadcastState = {
  broadcasts: [],
  loading: false,
};

const broadcastSlice = createSlice({
  name: 'broadcast',
  initialState,
  reducers: {
    setBroadcasts: (state, action: PayloadAction<Broadcast[]>) => {
      state.broadcasts = action.payload;
    },
    addBroadcast: (state, action: PayloadAction<Broadcast>) => {
      state.broadcasts.unshift(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setBroadcasts, addBroadcast, setLoading } = broadcastSlice.actions;
export default broadcastSlice.reducer;