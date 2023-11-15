import { mapOrder } from '~/utils/sorts';
import Column from './ListColumns/Column/Column';
import ListColumns from './ListColumns/ListColumns';
import Card from './ListColumns/Column/ListCards/Card/Card';

import { useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import Box from '@mui/material/Box';

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD',
};

const BoardContent = ({ board }) => {
  // const pointerSensor = useSensor(PointerSensor, {
  //   activationConstraint: { distance: 10 },
  // });

  // Yêu cầu chuột di chuyển 10px thì mới kích hoạt event, fix trường hợp click vào column bị gọi event
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 },
  });

  // Nhấn và giữ 250ms và dung sai của cảm ứng (khi di chuyển 500px) thì mới kích hoạt event
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 500 },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  const [orderedColumns, setOrderedColumns] = useState([]);

  // Tại cùng một thời điểm, chỉ có một phần tử là column hoặc là card được kéo
  const [activeDragItemId, setActiveDragItemId] = useState(null);
  const [activeDragItemType, setActiveDragItemType] = useState(null);
  const [activeDragItemData, setActiveDragItemData] = useState(null);

  useEffect(() => {
    setOrderedColumns(mapOrder(board?.columns, board?.columnOrderIds, '_id'));
  }, [board]);

  const handleDragStart = (e) => {
    setActiveDragItemId(e?.active?.id);
    setActiveDragItemType(
      e?.active?.data?.current?.columnId
        ? ACTIVE_DRAG_ITEM_TYPE.CARD
        : ACTIVE_DRAG_ITEM_TYPE.COLUMN
    );
    setActiveDragItemData(e?.active?.data?.current);
  };

  const handleDragEnd = (e) => {
    const { active, over } = e;
    //Link dan toi ham arrayMove cua dndkit github.com/clauderic/dnd-kit/blob/master/packages/sortable/src/utilities/arrayMove.ts

    // Kiểm tra nếu không tồn tại over (kéo tới vị trí bị lỗi) sẽ return
    if (!over) return;

    if (active.id !== over.id) {
      // Vi tri column cu tu active
      const oldIndex = orderedColumns.findIndex((c) => c._id === active.id);

      // Vi tri column moi tu over
      const newIndex = orderedColumns.findIndex((c) => c._id === over.id);

      const dndOrderedColumns = arrayMove(orderedColumns, oldIndex, newIndex);
      // const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
      // console.log(dndOrderedColumnsIds)
      setOrderedColumns(dndOrderedColumns);
    }

    setActiveDragItemId(null);
    setActiveDragItemType(null);
    setActiveDragItemData(null);
  };

  const customsDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <Box
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? '#34495e' : '#1976d2',
          width: '100%',
          height: (theme) => theme.trello.boardContentHeight,
          p: '8px 0',
        }}
      >
        <ListColumns columns={orderedColumns} />
        <DragOverlay dropAnimation={customsDropAnimation}>
          {!activeDragItemType && null}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && (
            <Column column={activeDragItemData} />
          )}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD && (
            <Card card={activeDragItemData} />
          )}
        </DragOverlay>
      </Box>
    </DndContext>
  );
};

export default BoardContent;
