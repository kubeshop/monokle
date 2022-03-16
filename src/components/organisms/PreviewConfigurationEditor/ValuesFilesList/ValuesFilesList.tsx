import {useCallback, useMemo} from 'react';

import {isObjectLike, orderBy} from 'lodash';

import {PreviewConfigValuesFileItem} from '@models/appconfig';

import {arrayMove} from '@utils/array';

import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy} from '@dnd-kit/sortable';

import {SortableItem} from './SortableItem';

import * as S from './styled';

interface ValuesFilesListProps {
  itemMap: Record<string, PreviewConfigValuesFileItem>;
  onChange: (itemMap: Record<string, PreviewConfigValuesFileItem>) => void;
}

function ValuesFilesList(props: ValuesFilesListProps) {
  const {itemMap, onChange} = props;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const checkItem = useCallback(
    (itemId: string) => {
      const item = itemMap[itemId] as any;
      if (!isObjectLike(item)) {
        return;
      }
      onChange({...itemMap, [itemId]: {...item, isChecked: !item.isChecked}});
    },
    [itemMap, onChange]
  );

  const orderedItems = useMemo(() => {
    return orderBy(Object.values(itemMap), ['order']);
  }, [itemMap]);

  const moveItem = useCallback(
    (itemId: string, dropIndex: number) => {
      const item = itemMap[itemId];
      const dropItem = Object.values(itemMap).find(i => i.order === dropIndex);
      if (!item || !dropItem) {
        return;
      }
      const itemIndex = orderedItems.findIndex(i => i.id === itemId);
      if (itemIndex === -1) {
        return;
      }
      const mutatedItems = arrayMove(orderedItems, itemIndex, dropIndex);
      const reorderedItems = mutatedItems.map((i, index) => ({...i, order: index}));
      onChange(Object.fromEntries(reorderedItems.map(i => [i.id, i])));
    },
    [itemMap, orderedItems, onChange]
  );

  const onDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    if (!over) {
      return;
    }
    if (active.id !== over.id) {
      const dropIndex = orderedItems.findIndex(i => i.id === over.id);
      moveItem(active.id, dropIndex);
    }
  };

  return (
    <S.List>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={orderedItems} strategy={verticalListSortingStrategy}>
          {orderedItems.map(item => {
            return <SortableItem item={item} key={item.id} checkItem={checkItem} />;
          })}
        </SortableContext>
      </DndContext>
    </S.List>
  );
}

export default ValuesFilesList;
