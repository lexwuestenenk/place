import { configureStore } from '@reduxjs/toolkit'
import accountReducer from './slices/accountSlice'
import canvasReducer from './slices/canvasSlice' 

export const store = configureStore({
    reducer: {
        account: accountReducer,
        canvas: canvasReducer
    },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store