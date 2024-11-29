import { useEffect } from 'react';
import { cloneDeep } from 'lodash';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Container from '@mui/material/Container';

import AppBar from '~/components/AppBar/AppBar';
import BoardBar from './BoardBar/BoardBar';
import BoardContent from './BoardContent/BoardContent';
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner';

import {
  fetchBoardDetailsAPI,
  updateCurrentActiveBoard,
  selectCurrentActiveBoard,
} from '~/redux/activeBoard/activeBoardSlice';

import {
  updateBoardDetailsAPI,
  updateColumnDetailsAPI,
  moveCardToDifferentColumnAPI,
} from '~/apis';

const Board = () => {
  const dispatch = useDispatch();
  const { boardId } = useParams();
  const board = useSelector(selectCurrentActiveBoard);

  useEffect(() => {
    dispatch(fetchBoardDetailsAPI(boardId));
  }, [dispatch, boardId]);

  // Hàm này có nhiệm vụ gọi api và xử lý khi kéo thả xong xuôi
  const moveColumns = (dndOrderedColumns) => {
    // Cập nhật state board
    const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id);
    // Spread Operator ở đây không bị lỗi vì không dùng push() thay đổi trực tiếp mà chỉ đang gán lại toàn bộ giá trị của columns và columnOrderIds vào 2 mảng mới
    const newBoard = { ...board };
    newBoard.columns = dndOrderedColumns;
    newBoard.columnOrderIds = dndOrderedColumnsIds;
    dispatch(updateCurrentActiveBoard(newBoard));

    // Gọi api update board
    updateBoardDetailsAPI(newBoard._id, {
      columnOrderIds: newBoard.columnOrderIds,
    });
  };

  // Khi di chuyển card trong cùng một column chỉ cần gọi api để cập nhật mảng cardOrderIds của column chứa nó (thay đổi vị trí trong mảng)
  const moveCardInTheSameColumn = (
    dndOrderedCards,
    dndOrderedCardIds,
    columnId
  ) => {
    // Cập nhật state board
    const newBoard = cloneDeep(board);
    const columnToUpdate = newBoard.columns.find(
      (column) => column._id === columnId
    );
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards;
      columnToUpdate.cardOrderIds = dndOrderedCardIds;
    }
    dispatch(updateCurrentActiveBoard(newBoard));

    // Gọi api update column
    updateColumnDetailsAPI(columnId, {
      cardOrderIds: dndOrderedCardIds,
    });
  };

  /**  Khi di chuyển card sang column khác:
   * B1: Cập nhật mảng cardOrderIds của column ban đầu chứa nó (xóa _id của card ra khỏi mảng)
   * B2: Cập nhật mảng cardOrderIds của column tiếp theo (thêm _id của card vào mảng)
   * B3: Cập nhật lại trường columnId mới của cái card đã kéo
   * => Xây dựng một api support riêng
   */
  const moveCardToDifferentColumn = (
    currentCardId,
    prevColumnId,
    nextColumnId,
    dndOrderedColumns
  ) => {
    // Cập nhật state board
    const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id);
    const newBoard = { ...board };
    newBoard.columns = dndOrderedColumns;
    newBoard.columnOrderIds = dndOrderedColumnsIds;
    dispatch(updateCurrentActiveBoard(newBoard));

    // Gọi api xử lý phía be
    let prevCardOrderIds = dndOrderedColumns.find(
      (c) => c._id === prevColumnId
    )?.cardOrderIds;
    // Xử lý vấn đề khi kéo card cuối cùng ra khỏi column, column rỗng sẽ có placeholder card cần xóa nó đi trước khi gửi dữ liệu lên phía be
    if (prevCardOrderIds[0].includes('placeholder-card')) {
      prevCardOrderIds = [];
    }

    moveCardToDifferentColumnAPI({
      currentCardId,
      prevColumnId,
      prevCardOrderIds,
      nextColumnId,
      nextCardOrderIds: dndOrderedColumns.find((c) => c._id === nextColumnId)
        ?.cardOrderIds,
    });
  };

  if (!board) {
    return <PageLoadingSpinner caption="Loading" />;
  }

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <AppBar />
      <BoardBar board={board} />
      <BoardContent
        board={board}
        moveColumns={moveColumns}
        moveCardInTheSameColumn={moveCardInTheSameColumn}
        moveCardToDifferentColumn={moveCardToDifferentColumn}
      />
    </Container>
  );
};

export default Board;
