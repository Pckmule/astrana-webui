import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../../app/store';

import AuthenticationService  from './../../services/AuthenticationService';

export enum SessionStatus
{
  Idle,
  Loading,
  Failed
}

export interface ISessionState {
  value: number;
  apiAuthorizationToken: string;
  status: SessionStatus;
}

const initialState: ISessionState = {
  value: 0,
  apiAuthorizationToken: "not set",
  status: SessionStatus.Idle,
};

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  
  reducers: {
    setAuthToken: (state, action: PayloadAction<string>) => 
    {
      state.apiAuthorizationToken = action.payload
    },
    
    clearAuthToken: (state) => {
      state.apiAuthorizationToken = ""
    }
  }
});

export const { clearAuthToken, setAuthToken } = sessionSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.session.value)`
export const selectAuthToken = (state: RootState) => state.session.apiAuthorizationToken;

export default sessionSlice.reducer;
