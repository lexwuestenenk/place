import { configureStore } from '@reduxjs/toolkit'
import accountReducer from './slices/accountSlice'
import canvasReducer from './slices/canvasSlice' 
import presenceReducer from './slices/presenceSlice'

export const store = configureStore({
    reducer: {
        account: accountReducer,
        canvas: canvasReducer,
        presence: presenceReducer
    },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store