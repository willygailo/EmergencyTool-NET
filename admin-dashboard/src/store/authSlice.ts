import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../shared/types/user.types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: typeof localStorage !== 'undefined' ? !!localStorage.getItem('token') : false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('token', action.payload.token);
      }
    },
    logout: (state, action: PayloadAction<{ user: User; token: string } | void>) => {
      state.user = action.payload?.user || null;
      state.token = action.payload?.token || null;
      state.isAuthenticated = !!action.payload?.token;
      if (typeof localStorage !== 'undefined') {
        if (action.payload?.token) {
          localStorage.setItem('token', action.payload.token);
        } else {
          localStorage.removeItem('token');
        }
      }
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;