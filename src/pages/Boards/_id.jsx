import { useEffect, useState } from 'react';
import { isEmpty } from 'lodash';

import Container from '@mui/material/Container';

import AppBar from '~/components/AppBar/AppBar';
import BoardBar from './BoardBar/BoardBar';
import BoardContent from './BoardContent/BoardContent';
import {
  fetchBoardDetailsAPI,
  updateBoardDetailsAPI,
  createNewColumnAPI,
  createNewCardAPI,
} from '~/apis';
import { generatePlaceholderCard } from '~/utils/formatters';

const Board = () => {
  const [board, setBoard] = useState(null);

  useEffect(() => {
    const boardId = '66520fe4add70c243359d450';
    // Call API
    fetchBoardDetailsAPI(boardId).then((board) => {
      // Xử lý kéo thả vào một column rỗng
      board.columns.forEach((column) => {
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)];
          column.cardOrderIds = [generatePlaceholderCard(column)._id];
        }
      });
      setBoard(board);
    });
  }, []);

  // Hàm này có nhiệm vụ gọi api tạo mới column và làm lại dữ liệu State Board
  const createNewColumn = async (newColumnData) => {
    const createdColumn = await createNewColumnAPI({
      ...newColumnData,
      boardId: board._id,
    });

    // Khi tạo column mới thì nó sẽ chưa có card, cần xử lý vấn đề kéo thả vào một column rỗng
    createdColumn.cards = [generatePlaceholderCard(createdColumn)];
    createdColumn.cardOrderIds = [generatePlaceholderCard(createdColumn)._id];

    // Cập nhật state board
    const newBoard = { ...board };
    newBoard.columns.push(createdColumn);
    newBoard.columnOrderIds.push(createdColumn._id);
    setBoard(newBoard);
  };

  // Hàm này có nhiệm vụ gọi api tạo mới card và làm lại dữ liệu State Board
  const createNewCard = async (newCardData) => {
    const createdCard = await createNewCardAPI({
      ...newCardData,
      boardId: board._id,
    });

    // Cập nhật state board
    const newBoard = { ...board };
    const columnToUpdate = newBoard.columns.find(
      (column) => column._id === createdCard.columnId
    );
    if (columnToUpdate) {
      columnToUpdate.cards.push(createdCard);
      columnToUpdate.cardOrderIds.push(createdCard._id);
    }
    setBoard(newBoard);
  };

  // Hàm này có nhiệm vụ gọi api và xử lý khi kéo thả xong xuôi
  const moveColumns = async (dndOrderedColumns) => {
    // Cập nhật state board
    const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id);
    const newBoard = { ...board };
    newBoard.columns = dndOrderedColumns;
    newBoard.columnOrderIds = dndOrderedColumnsIds;
    setBoard(newBoard);

    // Gọi api update board
    await updateBoardDetailsAPI(newBoard._id, {
      columnOrderIds: newBoard.columnOrderIds,
    });
  };

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <AppBar />
      <BoardBar board={board} />
      <BoardContent
        board={board}
        createNewColumn={createNewColumn}
        createNewCard={createNewCard}
        moveColumns={moveColumns}
      />
    </Container>
  );
};

export default Board;
