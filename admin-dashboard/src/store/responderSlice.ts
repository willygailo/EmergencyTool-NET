import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Responder } from '../shared/types/responder.types';

interface ResponderState {
  responders: Responder[];
  loading: boolean;
  error: string | null;
}

const initialState: ResponderState = {
  responders: [],
  loading: false,
  error: null,
};

const responderSlice = createSlice({
  name: 'responder',
  initialState,
  reducers: {
    setResponders: (state, action: PayloadAction<Responder[]>) => {
      state.responders = action.payload;
    },
    addResponder: (state, action: PayloadAction<Responder>) => {
      state.responders.push(action.payload);
    },
    updateResponder: (state, action: PayloadAction<Responder>) => {
      const index = state.responders.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.responders[index] = action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setResponders, addResponder, updateResponder, setLoading, setError } = responderSlice.actions;
export default responderSlice.reducer;