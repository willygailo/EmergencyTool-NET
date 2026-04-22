import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AnalyticsState {
  stats: any;
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  stats: null,
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setStats: (state, action: PayloadAction<any>) => {
      state.stats = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setStats, setLoading, setError } = analyticsSlice.actions;
export default analyticsSlice.reducer;