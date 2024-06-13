import Box from '@mui/material/Box';
import { cloneDeep, isEmpty } from 'lodash';
import { arrayMove } from '@dnd-kit/sortable';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  pointerWithin,
  closestCorners,
  getFirstCollision,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';

import Column from './ListColumns/Column/Column';
import ListColumns from './ListColumns/ListColumns';
import Card from './ListColumns/Column/ListCards/Card/Card';
import { generatePlaceholderCard } from '~/utils/formatters';
import { MouseSensor, TouchSensor } from '~/customLibraries/DndKitSensors';

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD',
};

const BoardContent = ({
  board,
  createNewColumn,
  createNewCard,
  moveColumns,
  deleteColumnDetails,
  moveCardInTheSameColumn,
  moveCardToDifferentColumn,
}) => {
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
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] =
    useState(null);

  // Điểm va chạm cuối cùng( xử lý thuật toán va chạm)
  const lastOverId = useRef(null);

  useEffect(() => {
    // Lúc này các columns đã được sắp xếp ở component cha cao nhất là board/_id.jsx
    setOrderedColumns(board.columns);
  }, [board]);

  // Tìm một cái Column theo CardId
  const findColumnByCardId = (cardId) => {
    return orderedColumns.find((column) =>
      column?.cards?.map((card) => card._id)?.includes(cardId)
    );
  };

  // Function chung xử lý việc cập nhật lại state trong trường hợp di chuyển card giữa các column khác nhau
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData,
    triggerFrom
  ) => {
    setOrderedColumns((prevColumns) => {
      // Tìm vị trí (index) của overCard trong column đích (nơi activeCard sắp được thả)
      const overCardIndex = overColumn?.cards?.findIndex(
        (card) => card._id === overCardId
      );

      // Logic tinh toán cardIndex mới
      let newCardIndex;
      const isBelowOverItem =
        active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height;

      const modifier = isBelowOverItem ? 1 : 0;

      newCardIndex =
        overCardIndex >= 0
          ? overCardIndex + modifier
          : overColumn?.cards?.length + 1;

      // Clone mảng orderedColumnsState cũ ra một cái mới để xử lý data rồi return -
      // cập nhật lại OrderedColumnState mới
      const nextColumns = cloneDeep(prevColumns);
      const nextActiceColumn = nextColumns.find(
        (column) => column._id === activeColumn._id
      );
      const nextOverColumn = nextColumns.find(
        (column) => column._id === overColumn._id
      );

      // Old Column
      if (nextActiceColumn) {
        // Xóa card ở cái column active (cũng có thể hiểu là column cũ, cái lúc mà kéo card ra để nó sang column khác)
        nextActiceColumn.cards = nextActiceColumn.cards.filter(
          (card) => card._id !== activeDraggingCardId
        );
        // Thêm placeholdercard nếu column rỗng: bị kéo hết card đi
        if (isEmpty(nextActiceColumn.cards)) {
          nextActiceColumn.cards = [generatePlaceholderCard(nextActiceColumn)];
        }
        // Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextActiceColumn.cardOrderIds = nextActiceColumn.cards.map(
          (card) => card._id
        );
      }

      // New Column
      if (nextOverColumn) {
        // Kiểm tra xem card đang kéo có tồn tại ở overColumn chưa, nếu có thì cần xóa nó trước
        nextOverColumn.cards = nextOverColumn.cards.filter(
          (card) => card._id !== activeDraggingCardId
        );
        // Phải cập nhật lại chuẩn dữ liệu columnId trong card sau khi kéo card giữa 2 column khác nhau
        const rebuild_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: overColumn._id,
        };
        // Tiếp theo là thêm card đang kéo vào overColumn theo vị trí Index mới
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(
          newCardIndex,
          0,
          rebuild_activeDraggingCardData
        );
        // Xóa đi placeholderCard khi nó đang tồn tại card
        nextOverColumn.cards = nextOverColumn.cards.filter(
          (card) => !card.FE_PlaceholderCard
        );
        // Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(
          (card) => card._id
        );
      }

      // Nếu function này được gọi từ handleDragEnd nghĩa là đã kéo thả xong, lúc này mới xử lý gọi api 1 lần ở đây
      if (triggerFrom === 'handleDragEnd') {
        moveCardToDifferentColumn(
          activeDraggingCardId,
          oldColumnWhenDraggingCard._id,
          nextOverColumn._id,
          nextColumns
        );
      }

      return nextColumns;
    });
  };

  const handleDragStart = (e) => {
    setActiveDragItemId(e?.active?.id);
    setActiveDragItemType(
      e?.active?.data?.current?.columnId
        ? ACTIVE_DRAG_ITEM_TYPE.CARD
        : ACTIVE_DRAG_ITEM_TYPE.COLUMN
    );
    setActiveDragItemData(e?.active?.data?.current);

    // Nếu là kéo card thì mới thực hiện hành động set giá trị oldColumn
    if (e?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(e?.active?.id));
    }
  };

  // Trigger trong qua trinh keo mot phan tu
  const handleDragOver = (e) => {
    // Không làm gi thêm nếu kéo column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return;
    }

    // Nếu kéo card thì xử lý thêm để có thể kéo card qua lại giữa các column
    // console.log('handleDragOver', e);
    const { active, over } = e;

    // Kiểm tra nếu không tồn tại over (kéo tới vị trí bị lỗi) sẽ return
    if (!active || !over) return;

    // activeDraggingCard là card đang được kéo
    const {
      id: activeDraggingCardId,
      data: { current: activeDraggingCardData },
    } = active;
    // overCard là card đang tương tác trên hoặc dưới so với cái card được kéo ở trên
    const { id: overCardId } = over;

    // tìm 2 columns theo cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId);
    const overColumn = findColumnByCardId(overCardId);

    if (!activeColumn || !overColumn) return;

    // Xử lý logic ở đây chỉ khi kéo card qua 2 column khác nhau, còn nếu kéo card trong một column thì không làm gì
    // Đoạn logic này sẽ xử lý khi đang kéo (handleDragOver)
    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData,
        'handleDragOver'
      );
    }
  };

  const handleDragEnd = (e) => {
    const { active, over } = e;
    //Link dan toi ham arrayMove cua dndkit github.com/clauderic/dnd-kit/blob/master/packages/sortable/src/utilities/arrayMove.ts

    // Kiểm tra nếu không tồn tại over (kéo tới vị trí bị lỗi) sẽ return
    if (!over) return;

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      // activeDraggingCard là card đang được kéo
      const {
        id: activeDraggingCardId,
        data: { current: activeDraggingCardData },
      } = active;
      // overCard là card đang tương tác trên hoặc dưới so với cái card được kéo ở trên
      const { id: overCardId } = over;

      // tìm 2 columns theo cardId
      const activeColumn = findColumnByCardId(activeDraggingCardId);
      const overColumn = findColumnByCardId(overCardId);

      if (!activeColumn || !overColumn) return;

      // Hành động kéo thả card giữa 2 column khác nhau
      // Phải dùng tới oldColumnWhenDraggingCard._id hoặc activeDragItemData.columnId
      // (set vào state từ bước handleDragStart) chứ không phải activeData trong scope
      // handleDragEnd này vì sau khi đi qua handleDragOver thì state của card bị cập nhật lại
      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData,
          'handleDragEnd'
        );
      } else {
        // Hành động kéo thả card trong cùng một column
        // Vi tri cu tu oldColumnWhenDraggingCard
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(
          (c) => c._id === activeDragItemId
        );
        // Vi tri moi tu over
        const newCardIndex = overColumn?.cards?.findIndex(
          (c) => c._id === overCardId
        );

        const dndOrderedCards = arrayMove(
          oldColumnWhenDraggingCard?.cards,
          oldCardIndex,
          newCardIndex
        );

        const dndOrderedCardIds = dndOrderedCards.map((card) => card._id);

        setOrderedColumns((prevColumns) => {
          const nextColumns = cloneDeep(prevColumns);

          // Tìm tới column đang thả
          const targetColumn = nextColumns.find(
            (c) => c._id === overColumn._id
          );
          targetColumn.cards = dndOrderedCards;
          targetColumn.cardOrderIds = dndOrderedCardIds;

          return nextColumns;
        });

        // Gọi props function moveCardInTheSameColumn nằm ở component cha cao nhất (board/_id.jsx)
        moveCardInTheSameColumn(
          dndOrderedCards,
          dndOrderedCardIds,
          oldColumnWhenDraggingCard._id
        );
      }
    }

    // Xử lý kéo thả Columns trong một cái boardContent
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      // Nếu vị trí sau khi kéo thả khác với vị trí ban đầu
      if (active.id !== over.id) {
        // Vi tri column cu tu active
        const oldColumnIndex = orderedColumns.findIndex(
          (c) => c._id === active.id
        );
        // Vi tri column moi tu over
        const newColumnIndex = orderedColumns.findIndex(
          (c) => c._id === over.id
        );

        const dndOrderedColumns = arrayMove(
          orderedColumns,
          oldColumnIndex,
          newColumnIndex
        );
        // Vẫn gọi update state ở đây để tránh delay hoặc Flickering giao diện lúc kéo thả cần phải chờ gọi api (trick)
        setOrderedColumns(dndOrderedColumns);
        // Gọi lên props function moveColumns nằm ở component cha cao nhất (boards/_id.jsx)
        moveColumns(dndOrderedColumns);
        // const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
        // console.log(dndOrderedColumnsIds)
      }
    }

    // Những dữ liệu sau khi kéo thả phải luôn phải đưa về giá trị null ban đầu
    setActiveDragItemId(null);
    setActiveDragItemType(null);
    setActiveDragItemData(null);
    setOldColumnWhenDraggingCard(null);
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

  const collisionDetectionStrategy = useCallback(
    (args) => {
      // Trường hợp kéo column thì dùng thuật toán closestCorners là chuẩn nhất
      if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
        return closestCorners({ ...args });
      }
      // Tìm các điểm giao nhau, va chạm với con trỏ
      const pointerIntersections = pointerWithin(args);
      // Nếu pointerIntersections là mảng rỗng, return luôn và không làm gì hết
      // Fix bug flickering của thư viện dnd-kit trong trường hợp:
      // kéo một cái card có image cover lớn và kéo lên phía trên column (ra khỏi khu vực kéo thả)
      if (!pointerIntersections?.length) return;
      // Thuật toán phát hiện va chạm và trả về các mảng va chạm tại đây
      // const intersections =
      //   pointerIntersections?.length > 0
      //     ? pointerIntersections
      //     : rectIntersection(args);

      // Tìm overId đàu tiên trong pointerIntersections
      let overId = getFirstCollision(pointerIntersections, 'id');
      if (overId) {
        // Nếu cái over nó là column thì sẽ tìm tới cardId gần nhất bên trong khu vực
        // va chạm đó dựa vào thuật toán phát hiện va chạm closestCenter hoặc closestCorners
        // đều được. Tuy nhiên ở đây dùng closestCorners sẽ mượt hơn
        const checkColumn = orderedColumns.find(
          (column) => column._id === overId
        );
        if (checkColumn) {
          overId = closestCorners({
            ...args,
            droppableContainers: args.droppableContainers.filter(
              (container) => {
                return (
                  container.id !== overId &&
                  checkColumn?.cardOrderIds?.includes(container.id)
                );
              }
            ),
          })[0]?.id;
        }
        lastOverId.current = overId;
        return [{ id: overId }];
      }
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeDragItemType, orderedColumns]
  );

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      // cảm biến
      sensors={sensors}
      // thuật toán phát hiện va chạm (nếu không có nó thì card với cover lớn sẽ không kéo qua column được vì lúc này nó bị conflict giữa card và column)
      // dùng closestCorners thay vì cloestCenter
      // Nếu chỉ dùng closestCorners sẽ có bug flickering + sai lệch dữ liệu
      // collisionDetection={closestCorners}
      collisionDetection={collisionDetectionStrategy}
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
        <ListColumns
          columns={orderedColumns}
          createNewColumn={createNewColumn}
          createNewCard={createNewCard}
          deleteColumnDetails={deleteColumnDetails}
        />
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
