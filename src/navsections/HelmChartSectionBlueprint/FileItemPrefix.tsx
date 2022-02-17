import {useMemo} from 'react';

import {FileOutlined} from '@ant-design/icons';

import {ItemCustomComponentProps} from '@models/navigator';

import Colors from '@styles/Colors';

const FileItemPrefix = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;

  const {fileItemPrefixStyle} = itemInstance.meta;

  const style = useMemo(() => {
    const baseStyle = {
      marginLeft: 4,
      marginRight: 8,
      color: itemInstance.isSelected ? Colors.blackPure : Colors.whitePure,
    };
    if (fileItemPrefixStyle) {
      return {
        ...baseStyle,
        ...fileItemPrefixStyle,
      };
    }
    return baseStyle;
  }, [fileItemPrefixStyle, itemInstance.isSelected]);

  return <FileOutlined style={style} />;
};

export default FileItemPrefix;
