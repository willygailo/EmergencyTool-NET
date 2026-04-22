import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface QueuedReport {
  id: string;
  type: string;
  data: any;
  createdAt: number;
}

interface OfflineState {
  isOffline: boolean;
  queuedReports: QueuedReport[];
}

const initialState: OfflineState = {
  isOffline: false,
  queuedReports: [],
};

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setOfflineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload;
    },
    addQueuedReport: (state, action: PayloadAction<QueuedReport>) => {
      state.queuedReports.push(action.payload);
    },
    clearQueuedReports: (state) => {
      state.queuedReports = [];
    },
  },
});

export const { setOfflineStatus, addQueuedReport, clearQueuedReports } = offlineSlice.actions;
export default offlineSlice.reducer;