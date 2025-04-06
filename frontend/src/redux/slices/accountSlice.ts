import { createSlice } from "@reduxjs/toolkit";

export interface User {
    id: string
    username: string
    email: string
    role: "user" | "admin"
    inserted_at: string
    updated_at: string
}

export interface AccountState {
    user: User,
    token: string,
}

const initialState: AccountState = {
    user: {
        id: "",
        username: "",
        email: "",
        role: "user",
        inserted_at: "",
        updated_at: ""
    },
    token: ""
};
  
export const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        login: (state, action) => {
            const { user, token } = action.payload
            state.user = user
            state.token = token
        },

        logout: (state) => {
            state.user = {
                id: "",
                username: "",
                email: "",
                role: "user",
                inserted_at: "",
                updated_at: ""
            };
            state.token = "";
        },
    }
})

export const { login, logout } = accountSlice.actions
export default accountSlice.reducer