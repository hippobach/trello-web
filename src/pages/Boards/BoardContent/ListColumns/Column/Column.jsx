import { useState } from 'react';
import { cloneDeep } from 'lodash';
import { toast } from 'react-toastify';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { useConfirm } from 'material-ui-confirm';
import { useSelector, useDispatch } from 'react-redux';

import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { TextField } from '@mui/material';
import Cloud from '@mui/icons-material/Cloud';
import CloseIcon from '@mui/icons-material/Close';
import AddCardIcon from '@mui/icons-material/AddCard';
import ListItemIcon from '@mui/material/ListItemIcon';
import ContentCut from '@mui/icons-material/ContentCut';
import ContentCopy from '@mui/icons-material/ContentCopy';
import ContentPaste from '@mui/icons-material/ContentPaste';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import DeleteForevericon from '@mui/icons-material/DeleteForever';

import ListCards from './ListCards/ListCards';
import { createNewCardAPI, deleteColumnDetailsAPI } from '~/apis';
import {
  selectCurrentActiveBoard,
  updateCurrentActiveBoard,
} from '~/redux/activeBoard/activeBoardSlice';

const Column = ({ column }) => {
  const dispatch = useDispatch();
  const board = useSelector(selectCurrentActiveBoard);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Card đã được sắp xếp ở component cha cao nhất là board/_id.jsx
  const orderedCards = column.cards;

  const [openNewCardForm, setOpenNewCardForm] = useState(false);
  const toggleOpenNewCardForm = () => setOpenNewCardForm(!openNewCardForm);

  const [newCardTitle, setNewCardTitle] = useState('');
  const addNewCard = async () => {
    if (!newCardTitle) {
      toast.error('Please enter the card title', {
        position: 'bottom-right',
      });
      return;
    }
    // Gọi API ở đây ...
    const newCardData = {
      title: newCardTitle,
      columnId: column._id,
    };

    // Gọi api tạo mới card và làm lại dữ liệu State Board
    const createdCard = await createNewCardAPI({
      ...newCardData,
      boardId: board._id,
    });

    // Cập nhật state board
    const newBoard = cloneDeep(board);
    const columnToUpdate = newBoard.columns.find(
      (column) => column._id === createdCard.columnId
    );
    if (columnToUpdate) {
      // Nếu column rỗng (bản chất vẫn đang chứa một placeholder card)
      if (columnToUpdate.cards.some((card) => card.FE_PlaceholderCard)) {
        columnToUpdate.cards = [createdCard];
        columnToUpdate.cardOrderIds = [createdCard._id];
      } else {
        // Ngược lại column đã có data thì push vào cuối mảng
        columnToUpdate.cards.push(createdCard);
        columnToUpdate.cardOrderIds.push(createdCard._id);
      }
    }
    dispatch(updateCurrentActiveBoard(newBoard));

    // Đóng trạng thái thêm Column mới & Clear input
    toggleOpenNewCardForm();
    setNewCardTitle('');
  };

  // Xử lý xóa một column và card
  const confirmDeleteColumn = useConfirm();

  const handleDeleteColumn = () => {
    confirmDeleteColumn({
      title: 'DELETE COLUMN',
      description: 'Are you sure you want to delete this column?',
      confirmationText: 'AGREE',
      cancellationText: 'DISAGREE',
    })
      .then(() => {
        // Update dữ liệu state board
        const newBoard = { ...board };
        newBoard.columns = newBoard.columns.filter((c) => c._id !== column._id);
        newBoard.columnOrderIds = newBoard.columnOrderIds.filter(
          (_id) => _id !== column._id
        );
        dispatch(updateCurrentActiveBoard(newBoard));
        // Gọi API
        deleteColumnDetailsAPI(column._id).then((res) => {
          toast.success(res?.deleteResult);
        });
      })
      .catch(() => {});
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column._id, data: { ...column } });

  const dndkitColumnStyles = {
    transform: CSS.Translate.toString(transform),
    transition,
    // Chiều cao luôn phải max 100% vì nếu không sẽ lỗi khi ta kéo column ngắn qua
    // các column dài, lúc này con chuột đặt ở giữa cũng sẽ kéo được gây khó chịu
    // khi ta muốn dịch chuyển page theo chiều ngang. Để làm điều đó phải kết hợp
    // với {...listeners} ở thẻ Box chứ không phải thẻ div
    height: '100%',
    opacity: isDragging ? 0.5 : undefined,
  };
  return (
    // Bọc thẻ div tại đây để chiều cao của column khi kéo thả k bị bug kiểu flickering
    <div ref={setNodeRef} style={dndkitColumnStyles} {...attributes}>
      <Box
        {...listeners}
        sx={{
          minWidth: '300px',
          maxWidth: '300px',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? '#333643' : '#ebecf0',
          ml: 2,
          borderRadius: '6px',
          height: 'fit-content',
          maxHeight: (theme) =>
            `calc(${theme.trello.boardContentHeight} - ${theme.spacing(5)})`,
        }}
      >
        {/* Box Column Header */}
        <Box
          sx={{
            height: (theme) => theme.trello.columnHeaderHeight,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}
          >
            {column?.title}
          </Typography>
          <Box>
            <Tooltip title="More options">
              <ExpandMoreIcon
                sx={{ color: 'text.primary', cursor: 'pointer' }}
                id="basic-column-dropdown"
                aria-controls={open ? 'basic-menu-column-dropdown' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
              />
            </Tooltip>
            <Menu
              id="basic-menu-column-dropdown"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-column-dropdown',
              }}
            >
              <MenuItem
                sx={{
                  '&:hover': {
                    color: 'success.light',
                    '& .add-card-icon': {
                      color: 'success.light',
                    },
                  },
                }}
                onClick={toggleOpenNewCardForm}
              >
                <ListItemIcon>
                  <AddCardIcon className="add-card-icon" fontSize="small" />
                </ListItemIcon>
                <ListItemText>Add new card</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <ContentCut fontSize="small" />
                </ListItemIcon>
                <ListItemText>Cut</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <ContentCopy fontSize="small" />
                </ListItemIcon>
                <ListItemText>Copy</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <ContentPaste fontSize="small" />
                </ListItemIcon>
                <ListItemText>Paste</ListItemText>
              </MenuItem>

              <Divider />
              <MenuItem>
                <ListItemIcon>
                  <Cloud fontSize="small" />
                </ListItemIcon>
                <ListItemText>Archive this column</ListItemText>
              </MenuItem>
              <MenuItem
                sx={{
                  '&:hover': {
                    color: 'warning.dark',
                    '& .delete-forever-icon': {
                      color: 'warning.dark',
                    },
                  },
                }}
                onClick={handleDeleteColumn}
              >
                <ListItemIcon>
                  <DeleteForevericon
                    className="delete-forever-icon"
                    fontSize="small"
                  />
                </ListItemIcon>
                <ListItemText>Delete this column</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        {/* Box Column ListCards */}
        <ListCards cards={orderedCards} />
        {/* Box Column Footer */}
        <Box
          sx={{
            height: (theme) => theme.trello.columnFooterHeight,
            p: 2,
          }}
        >
          {!openNewCardForm ? (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Button
                startIcon={<AddCardIcon />}
                onClick={toggleOpenNewCardForm}
              >
                Add new card
              </Button>
              <Tooltip title="Drag to move">
                <DragHandleIcon sx={{ cursor: 'pointer' }} />
              </Tooltip>
            </Box>
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <TextField
                label="Enter card title"
                type="text"
                size="small"
                variant="outlined"
                autoFocus
                data-no-dnd="true"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                sx={{
                  '& label': { color: 'text.primary' },
                  '& input': {
                    color: (theme) => theme.palette.primary.main,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? '#333643' : 'white',
                  },
                  '& label.Mui-focused': {
                    color: (theme) => theme.palette.primary.main,
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: (theme) => theme.palette.primary.main,
                    },
                    '&:hover fieldset': {
                      borderColor: (theme) => theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: (theme) => theme.palette.primary.main,
                    },
                    '& .MuiOutlinedInput-input': {
                      borderRadius: 1,
                    },
                  },
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  onClick={addNewCard}
                  variant="contained"
                  color="success"
                  size="small"
                  sx={{
                    boxShadow: 'none',
                    border: '0.5px solid',
                    borderColor: (theme) => theme.palette.success.main,
                    '&:hover': {
                      bgcolor: (theme) => theme.palette.success.main,
                    },
                  }}
                >
                  Add
                </Button>
                <CloseIcon
                  fontSize="small"
                  sx={{
                    color: (theme) => theme.palette.warning.light,
                    cursor: 'pointer',
                  }}
                  onClick={toggleOpenNewCardForm}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </div>
  );
};

export default Column;
