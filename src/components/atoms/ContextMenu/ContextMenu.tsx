import {ReactNode} from 'react';

import {Dropdown, MenuProps} from 'antd';

interface ContextMenuProps {
  children: ReactNode;
  items: MenuProps['items'];
  disabled?: boolean;
  trigger?: ('contextMenu' | 'click' | 'hover')[];
  triggerOnRightClick?: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = props => {
  const {children, disabled = false, items, trigger = ['click'], triggerOnRightClick = false} = props;

  return (
    <Dropdown
      disabled={disabled}
      menu={{items}}
      trigger={triggerOnRightClick ? ['contextMenu'] : trigger}
      placement="bottom"
    >
      {children}
    </Dropdown>
  );
};

export default ContextMenu;
