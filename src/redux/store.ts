import mainReducer from "./reducer";
import { configureStore} from '@reduxjs/toolkit';

const store = configureStore({
  reducer: mainReducer
})

// eslint-disable-next-line no-undef
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store;
