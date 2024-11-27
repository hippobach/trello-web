import { isEmpty } from 'lodash';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { mapOrder } from '~/utils/sorts';
import { API_ROOT } from '~/utils/constants';
import { generatePlaceholderCard } from '~/utils/formatters';
import authorizedAxiosInstance from '~/utils/authorizeAxios';

// Khởi tạo giá trị State của một slice trong redux
const initialState = {
  currentActiveBoard: null,
};

// Các hành động gọi API (bất đồng bộ) và cập nhật dữ liệu vào redux, dùng middleware createAsyncThunk đi kèm với extraReducers
export const fetchBoardDetailsAPI = createAsyncThunk(
  'activeBoard/fetchBoardDetailsAPI',
  async (boardId) => {
    const response = await authorizedAxiosInstance.get(
      `${API_ROOT}/v1/boards/${boardId}`
    );
    // Note: axios sẽ trả về kết quả về qua property là data
    return response.data;
  }
);

// Khởi tạo một slice trong kho lưu trữ redux store
export const activeBoardSlice = createSlice({
  name: 'activeBoard',
  initialState,
  // reducers: nơi xử lý dữ liệu đồng bộ
  reducers: {
    updateCurrentActiveBoard: (state, action) => {
      // action.payload là một chuẩn đặt tên để nhận dữ liệu và reducer
      const board = action.payload;
      // Xử lý dữ liệu nếu cân thiết ...
      // Cập nhật lại dữ liệu của currentActiveBoard
      state.currentActiveBoard = board;
    },
  },
  // ExtraReducers: nơi xử lý dữ liệu bất đồng bộ
  extraReducers: (builder) => {
    builder.addCase(fetchBoardDetailsAPI.fulfilled, (state, action) => {
      // action.payload laf response.data trả về ở trên
      let board = action.payload;
      // Xử lý dữ liệu trước khi cập nhật state vào trong kho redux
      // Sắp xếp các column theo thứ tự trước khi đưa dữ liệu xuống bên dưới
      board.columns = mapOrder(board.columns, board.columnOrderIds, '_id');
      board.columns.forEach((column) => {
        // Xử lý kéo thả vào một column rỗng
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)];
          column.cardOrderIds = [generatePlaceholderCard(column)._id];
        } else {
          // Sắp xếp thứ tự các card ở đây trước khi đưa dữ liệu xuống các component con
          column.cards = mapOrder(column.cards, column.cardOrderIds, '_id');
        }
      });
      state.currentActiveBoard = board;
    });
  },
});

// Actions: là nơi cho các components phía dưới gọi bằng dispatch() tới nó để cập nhật lại dữ liệu thông qua reducer (chạy đồng bộ)
export const { updateCurrentActiveBoard } = activeBoardSlice.actions;

// Selectors: là nơi dành cho các components bên dưới gọi bằng hook useSelector() để lấy dữ liệu từ trong kho redux store ra sử dụng
export const selectCurrentActiveBoard = (state) => {
  return state.activeBoard.currentActiveBoard;
};

export const activeBoardReducer = activeBoardSlice.reducer;
// export default activeBoardSlice.reducer;
