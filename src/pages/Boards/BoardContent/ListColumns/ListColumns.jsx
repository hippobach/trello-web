import { useState } from 'react';
import { cloneDeep } from 'lodash';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Column from './Column/Column';
import Button from '@mui/material/Button';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

import { TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
// import theme from '~/theme';
import { createNewColumnAPI } from '~/apis';
import { generatePlaceholderCard } from '~/utils/formatters';
import {
  updateCurrentActiveBoard,
  selectCurrentActiveBoard,
} from '~/redux/activeBoard/activeBoardSlice';

const ListColumns = ({ columns }) => {
  const dispatch = useDispatch();
  const board = useSelector(selectCurrentActiveBoard);
  const [openNewColumnForm, setOpenNewColumnForm] = useState(false);
  const toggleOpenNewColumnForm = () =>
    setOpenNewColumnForm(!openNewColumnForm);

  const [newColumnTitle, setNewColumnTitle] = useState('');
  const addNewColumn = async () => {
    if (!newColumnTitle) {
      toast.error('Please enter the column title');
      return;
    }
    // Tạo dữ liệu Column để gọi api
    const newColumnData = {
      title: newColumnTitle,
    };

    // gọi api tạo mới column và làm lại dữ liệu State Board
    const createdColumn = await createNewColumnAPI({
      ...newColumnData,
      boardId: board._id,
    });

    // Khi tạo column mới thì nó sẽ chưa có card, cần xử lý vấn đề kéo thả vào một column rỗng
    createdColumn.cards = [generatePlaceholderCard(createdColumn)];
    createdColumn.cardOrderIds = [generatePlaceholderCard(createdColumn)._id];

    // Cập nhật state board
    // SpreadOperator đang là Shallow Copy -> Phải sử dụng Deep Copy trong redux
    // Nếu dùng Spread Operator sẽ bị lỗi Object is not extensible -> lỗi rules Imutability trong Redux Toolkit
    const newBoard = cloneDeep(board);
    newBoard.columns.push(createdColumn);
    newBoard.columnOrderIds.push(createdColumn._id);
    dispatch(updateCurrentActiveBoard(newBoard));

    // Có thể dùng array.concat() thay cho push() như trong docs của Redux Toolkit vì push sẽ thay đổi mảng trực tiếp, còn concat thì sẽ merge - ghép mảng lại và tạo ra một mảng mới để gán lại giá trị
    // const newBoard = { ...board };
    // newBoard.columns = newBoard.columns.concat([createdColumn]);
    // newBoard.columnOrderIds = newBoard.columnOrderIds.concat([
    //   createdColumn._id,
    // ]);
    // dispatch(updateCurrentActiveBoard(newBoard));

    // Đóng trạng thái thêm Column mới & Clear input
    toggleOpenNewColumnForm();
    setNewColumnTitle('');
  };

  return (
    <SortableContext
      items={columns?.map((c) => c._id)}
      strategy={horizontalListSortingStrategy}
    >
      <Box
        sx={{
          bgcolor: 'inherit',
          width: '100%',
          height: '100%',
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden',
          '&::-webkit-scrollbar-track': {
            m: 2,
          },
        }}
      >
        {columns?.map((column) => {
          return <Column key={column._id} column={column} />;
        })}

        {!openNewColumnForm ? (
          <Box
            onClick={toggleOpenNewColumnForm}
            sx={{
              minWidth: '250px',
              maxWidth: '250px',
              mx: 2,
              borderRadius: '6px',
              height: 'fit-content',
              bgcolor: '#ffffff3d',
            }}
          >
            <Button
              startIcon={<NoteAddIcon />}
              sx={{
                color: 'white',
                width: '100%',
                justifyContent: 'flex-start',
                pl: 2.5,
                py: 1,
              }}
            >
              Add new column
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              minWidth: '250px',
              maxWidth: '250px',
              mx: 2,
              p: 1,
              borderRadius: '6px',
              height: 'fit-content',
              bgcolor: '#ffffff3d',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <TextField
              label="Enter column title"
              type="text"
              size="small"
              variant="outlined"
              autoFocus
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              sx={{
                '& label': { color: 'white' },
                '& input': { color: 'white' },
                '& label.Mui-focused': { color: 'white' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'white',
                  },
                  '&:hover fieldset': {
                    borderColor: 'white',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                  },
                },
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                onClick={addNewColumn}
                variant="contained"
                color="success"
                size="small"
                sx={{
                  boxShadow: 'none',
                  border: '0.5px solid',
                  borderColor: (theme) => theme.palette.success.main,
                  '&:hover': { bgcolor: (theme) => theme.palette.success.main },
                }}
              >
                Add Column
              </Button>
              <CloseIcon
                fontSize="small"
                sx={{
                  color: 'white',
                  cursor: 'pointer',
                  '&:hover': { color: (theme) => theme.palette.warning.light },
                }}
                onClick={toggleOpenNewColumnForm}
              />
            </Box>
          </Box>
        )}
      </Box>
    </SortableContext>
  );
};

export default ListColumns;
