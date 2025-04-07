import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PresenceMeta = {
    username: string;
    x: number;
    y: number;
    color?: string;
  };
  
export type PresenceState = {
    [userId: string]: PresenceMeta;
  };
  
  
const initialState: PresenceState = {};

const presenceSlice = createSlice({
    name: 'presence',
    initialState,
    reducers: {
        setPresenceState(_, action: PayloadAction<PresenceState>) {
            return action.payload;
        },
        updateUserPresence(state, action: PayloadAction<{ userId: string; data: PresenceMeta }>) {
            state[action.payload.userId] = action.payload.data;
        },
        removeUserPresence(state, action: PayloadAction<string>) {
            delete state[action.payload];
        },
    },
});

export const { setPresenceState, updateUserPresence, removeUserPresence } = presenceSlice.actions;
export default presenceSlice.reducer;
