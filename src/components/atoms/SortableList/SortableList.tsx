import {useCallback} from 'react';

import {Checkbox} from 'antd';

import {ArrowDownOutlined, ArrowUpOutlined} from '@ant-design/icons';

import {arrayMove} from '@utils/array';

import * as S from './styled';

export type SortableListItem = {
  id: string;
  text: string;
  isChecked: boolean;
};

type SortableListProps = {
  items: SortableListItem[];
  onChange: (items: SortableListItem[]) => void;
};

const SortableList: React.FC<SortableListProps> = props => {
  const {items, onChange} = props;

  const checkItem = useCallback(
    (itemId: string) => {
      onChange(items.slice().map(item => (item.id === itemId ? {...item, isChecked: !item.isChecked} : item)));
    },
    [items, onChange]
  );

  const moveItem = useCallback(
    (itemId: string, direction: 'up' | 'down') => {
      const coefficient = direction === 'up' ? -1 : 1;
      const itemIndex = items.findIndex(i => i.id === itemId);
      if (!itemIndex) {
        return;
      }
      onChange(arrayMove(items, itemIndex, itemIndex + coefficient));
    },
    [items, onChange]
  );

  return (
    <S.List>
      {items.map((item, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <S.ListItem key={`${item.id}-${index}`}>
          <span>
            <span style={{marginRight: 8}}>{index + 1}.</span>
            <span onClick={() => checkItem(item.id)}>
              <Checkbox checked={item.isChecked} />
              <span style={{marginLeft: 8, cursor: 'pointer'}}>{item.text}</span>
            </span>
          </span>
          <span>
            <ArrowUpOutlined onClick={() => moveItem(item.id, 'up')} />
            <ArrowDownOutlined style={{marginLeft: 8}} onClick={() => moveItem(item.id, 'down')} />
          </span>
        </S.ListItem>
      ))}
    </S.List>
  );
};

export default SortableList;
