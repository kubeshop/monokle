import {useRef} from 'react';
import {DragSourceMonitor, useDrag, useDrop} from 'react-dnd';

import {Checkbox} from 'antd';

import {DragOutlined} from '@ant-design/icons';

import type {Identifier, XYCoord} from 'dnd-core';

import {ListItem} from './types';

import * as S from './styled';

type DragItem = {
  id: string;
  index: number;
};

type SortableListItemProps = {
  item: ListItem;
  index: number;
  checkItem: (itemId: string) => void;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
};

/**
 * This component is inspired by https://react-dnd.github.io/react-dnd/examples/sortable/simple
 */
const SortableListItem: React.FC<SortableListItemProps> = props => {
  const {item, index, checkItem, moveItem, onDragStart, onDragEnd} = props;

  const dragRef = useRef<HTMLSpanElement>(null);
  const previewRef = useRef<HTMLLIElement>(null);

  const [{opacity}, drag, preview] = useDrag({
    type: 'item',
    item: () => {
      onDragStart();
      return {id: item.id, index};
    },
    end: () => {
      onDragEnd();
    },
    collect: (monitor: DragSourceMonitor) => ({
      opacity: monitor.isDragging() ? 0.4 : 1,
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop<DragItem, void, {handlerId: Identifier | null}>({
    accept: 'item',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(hoveredItem: DragItem, monitor) {
      if (!previewRef.current) {
        return;
      }

      const dragIndex = hoveredItem.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = previewRef.current.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveItem(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      hoveredItem.index = hoverIndex;
    },
  });

  drag(dragRef);
  drop(preview(previewRef));

  return (
    <S.ListItem ref={previewRef} key={`${item.id}-${index}`} $opacity={opacity}>
      <span onClick={() => checkItem(item.id)}>
        <Checkbox checked={item.isChecked} />
        <span style={{marginLeft: 8, cursor: 'pointer'}}>{item.text}</span>
      </span>
      <S.DragHandle ref={dragRef}>
        <DragOutlined />
      </S.DragHandle>
    </S.ListItem>
  );
};

export default SortableListItem;
