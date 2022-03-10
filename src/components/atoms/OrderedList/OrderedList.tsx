import {useCallback, useMemo} from 'react';

import {Checkbox} from 'antd';

import {ArrowDownOutlined, ArrowUpOutlined} from '@ant-design/icons';

import {isObjectLike, orderBy} from 'lodash';

import * as S from './styled';

interface OrderedListProps<ItemType> {
  itemMap: Record<string, ItemType>;
  onChange: (itemMap: Record<string, ItemType>) => void;
  idPropName: string;
  checkedPropName: string;
  orderPropName: string;
  textPropName: string;
}

function OrderedList<ItemType>(props: OrderedListProps<ItemType>) {
  const {itemMap, onChange, idPropName, checkedPropName, orderPropName, textPropName} = props;

  const checkItem = useCallback(
    (itemId: string) => {
      const item = itemMap[itemId] as any;
      if (!isObjectLike(item)) {
        return;
      }
      onChange({...itemMap, [itemId]: {...item, [checkedPropName]: !item[checkedPropName]}});
    },
    [itemMap, checkedPropName, onChange]
  );

  const moveItem = useCallback(
    (itemId: string, dropIndex: number) => {
      const item = itemMap[itemId] as any;
      const dropItem = Object.values(itemMap).find(
        (i: any) => isObjectLike(i) && i[orderPropName] === dropIndex
      ) as any;
      if (!isObjectLike(item) || !isObjectLike(dropItem)) {
        return;
      }
      const dropItemId = dropItem[idPropName];
      if (!dropItemId) {
        return;
      }
      onChange({
        ...itemMap,
        [itemId]: {
          ...item,
          [orderPropName]: dropItem[orderPropName],
        },
        [dropItemId]: {
          ...dropItem,
          [orderPropName]: item[orderPropName],
        },
      });
    },
    [itemMap, onChange, idPropName, orderPropName]
  );

  const orderedItems = useMemo(() => {
    return orderBy(Object.values(itemMap), [orderPropName]).filter(
      (item: any) =>
        isObjectLike(item) &&
        typeof item[idPropName] === 'string' &&
        typeof item[orderPropName] === 'number' &&
        typeof item[checkedPropName] === 'boolean'
    ) as Record<string, any>[];
  }, [itemMap, idPropName, checkedPropName, orderPropName]);

  return (
    <S.List>
      {orderedItems.map(item => {
        return (
          <S.ListItem key={item[orderPropName]}>
            <span>
              <span style={{marginRight: 8}}>{item[orderPropName] + 1}.</span>
              <span onClick={() => checkItem(item[idPropName])}>
                <Checkbox checked={item[checkedPropName]} />
                <span style={{marginLeft: 8, cursor: 'pointer'}}>{item[textPropName]}</span>
              </span>
            </span>
            <span>
              <ArrowUpOutlined onClick={() => moveItem(item[idPropName], item[orderPropName] - 1)} />
              <ArrowDownOutlined
                style={{marginLeft: 8}}
                onClick={() => moveItem(item[idPropName], item[orderPropName] + 1)}
              />
            </span>
          </S.ListItem>
        );
      })}
    </S.List>
  );
}

export default OrderedList;
