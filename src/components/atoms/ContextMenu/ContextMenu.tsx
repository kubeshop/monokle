import {ReactNode} from 'react';

import {Dropdown} from 'antd';

interface ContextMenuProps {
  children: ReactNode;
  overlay: React.ReactElement;
  disabled?: boolean;
  triggerOnRightClick?: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = props => {
  const {overlay, children, disabled = false, triggerOnRightClick = false} = props;

  return (
    <Dropdown
      disabled={disabled}
      overlay={overlay}
      trigger={triggerOnRightClick ? ['contextMenu'] : ['click']}
      placement="bottom"
    >
      {children}
    </Dropdown>
  );
};

export default ContextMenu;
