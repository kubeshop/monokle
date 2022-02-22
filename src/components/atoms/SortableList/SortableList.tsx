import {useCallback, useState} from 'react';
import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';

import SortableListItem from './SortableListItem';
import {ListItem} from './types';

import * as S from './styled';

type SortableListProps = {
  items: ListItem[];
  onChange: (items: ListItem[]) => void;
};

const SortableList: React.FC<SortableListProps> = props => {
  const {items, onChange} = props;

  const [isDragging, setIsDragging] = useState(false);

  const checkItem = useCallback(
    (itemId: string) => {
      onChange(items.slice().map(item => (item.id === itemId ? {...item, isChecked: !item.isChecked} : item)));
    },
    [items, onChange]
  );

  const moveItem = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const itemsCopy = items.slice();
      const [draggedItem] = itemsCopy.splice(dragIndex, 1);
      itemsCopy.splice(hoverIndex, 0, draggedItem);
      onChange(itemsCopy);
    },
    [items, onChange]
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <S.List>
        {items.map((item, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <SortableListItem
            key={item.id}
            item={item}
            index={index}
            checkItem={checkItem}
            moveItem={moveItem}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
          />
        ))}
      </S.List>
    </DndProvider>
  );
};

export default SortableList;
