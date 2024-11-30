import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { API_ROOT } from '~/utils/constants';
import authorizedAxiosInstance from '~/utils/authorizeAxios';

const initialState = {
  currentUser: null,
};

// Các hành động gọi API (bất đồng bộ) và cập nhật dữ liệu vào redux, dùng middleware createAsyncThunk đi kèm với extraReducers
export const loginUserAPI = createAsyncThunk(
  'user/loginUserAPI',
  async (data) => {
    const response = await authorizedAxiosInstance.post(
      `${API_ROOT}/v1/users/login`,
      data
    );
    // Note: axios sẽ trả về kết quả về qua property là data
    return response.data;
  }
);

// Khởi tạo một slice trong kho lưu trữ redux store
export const userSlice = createSlice({
  name: 'user',
  initialState,
  // reducers: nơi xử lý dữ liệu đồng bộ
  reducers: {},
  // ExtraReducers: nơi xử lý dữ liệu bất đồng bộ
  extraReducers: (builder) => {
    builder.addCase(loginUserAPI.fulfilled, (state, action) => {
      // action.payload là response.data trả về ở trên
      const user = action.payload;
      state.currentUser = user;
    });
  },
});

// export const {} = userSlice.actions;

export const selectCurrentUser = (state) => {
  return state.user.currentUser;
};

export const userReducer = userSlice.reducer;
