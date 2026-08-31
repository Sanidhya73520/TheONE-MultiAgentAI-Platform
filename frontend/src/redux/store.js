import { configureStore } from '@reduxjs/toolkit'
import userReducer from "./userSlice.js";
import conversationReducer from "./conversationSlice.js";
import messsageReducer from "./messageSlice.js";

export const store = configureStore({
  reducer: {
    user: userReducer,
    conversation: conversationReducer,
    message: messsageReducer
  },
})