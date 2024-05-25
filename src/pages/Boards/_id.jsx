import { useEffect, useState } from 'react';

import Container from '@mui/material/Container';

import AppBar from '~/components/AppBar/AppBar';
import BoardBar from './BoardBar/BoardBar';
import BoardContent from './BoardContent/BoardContent';
import { fetchBoardDetailsAPI } from '~/apis';

import { mockData } from '~/apis/mock-data';

const Board = () => {
  const [board, setBoard] = useState(null);

  useEffect(() => {
    const boardId = '66486d9211174dcb4c27a051';
    // Call API
    fetchBoardDetailsAPI(boardId).then((board) => {
      setBoard(board);
    });
  }, []);

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <AppBar />
      <BoardBar board={mockData.board} />
      <BoardContent board={mockData.board} />
    </Container>
  );
};

export default Board;
