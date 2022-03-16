import React, {useCallback} from 'react';

import {Checkbox} from 'antd';

import {DragOutlined} from '@ant-design/icons';

import path from 'path';

import {PreviewConfigValuesFileItem} from '@models/appconfig';

import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

import * as S from './styled';

export type SortableItemProps = {
  item: PreviewConfigValuesFileItem;
  checkItem: (itemId: string) => void;
};

export function SortableItem(props: SortableItemProps) {
  const {item, checkItem} = props;
  const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: item.id});

  const getItemName = useCallback((i: PreviewConfigValuesFileItem) => path.basename(i.filePath), []);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <S.ListItem key={item.order}>
        <span>
          <S.ItemOrder style={{marginRight: 8}}>{item.order + 1}.</S.ItemOrder>
          <S.ItemName onClick={() => checkItem(item.id)}>
            <Checkbox checked={item.isChecked} />
            <span style={{marginLeft: 8, cursor: 'pointer'}}>{getItemName(item)}</span>
          </S.ItemName>
        </span>
        <S.DragHandle {...listeners}>
          <DragOutlined />
        </S.DragHandle>
      </S.ListItem>
    </div>
  );
}
