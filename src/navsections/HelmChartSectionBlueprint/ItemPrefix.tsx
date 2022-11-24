import {useMemo} from 'react';

import {EyeOutlined, FileOutlined} from '@ant-design/icons';

import {Icon} from '@atoms';

import {ItemCustomComponentProps} from '@shared/models/navigator';
import {Colors} from '@shared/styles/colors';

const ItemPrefix = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;

  const {itemPrefixStyle, itemPrefixIcon} = itemInstance.meta;

  const style = useMemo(() => {
    const baseStyle = {
      marginLeft: 4,
      marginRight: 8,
      color: itemInstance.isSelected ? Colors.blackPure : Colors.whitePure,
    };
    if (itemPrefixStyle) {
      return {
        ...baseStyle,
        ...itemPrefixStyle,
      };
    }
    return baseStyle;
  }, [itemPrefixStyle, itemInstance.isSelected]);

  if (itemPrefixIcon === 'file') {
    return <FileOutlined style={style} />;
  }

  if (itemPrefixIcon === 'helm') {
    return <Icon name="helm" style={{...style, fontSize: 18, transform: 'translateY(1px)'}} />;
  }

  return <EyeOutlined style={style} />;
};

export default ItemPrefix;
