import {ReactNode} from 'react';

import {Dropdown, MenuProps} from 'antd';

interface ContextMenuProps {
  children: ReactNode;
  items: MenuProps['items'];
  disabled?: boolean;
  triggerOnRightClick?: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = props => {
  const {children, disabled = false, items, triggerOnRightClick = false} = props;

  return (
    <Dropdown
      disabled={disabled}
      menu={{items}}
      trigger={triggerOnRightClick ? ['contextMenu'] : ['click']}
      placement="bottom"
    >
      {children}
    </Dropdown>
  );
};

export default ContextMenu;
