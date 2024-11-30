import { configureStore } from '@reduxjs/toolkit';
import { userReducer } from '~/redux/user/userSlice';
import { activeBoardReducer } from './activeBoard/activeBoardSlice';

export const store = configureStore({
  reducer: { activeBoard: activeBoardReducer, user: userReducer },
});
