import {ReactNode} from 'react';

import {Dropdown} from 'antd';

interface ContextMenuProps {
  children: ReactNode;
  overlay: React.ReactElement;
  triggerOnRightClick?: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = props => {
  const {overlay, children, triggerOnRightClick = false} = props;

  return (
    <Dropdown overlay={overlay} trigger={triggerOnRightClick ? ['contextMenu'] : ['click']} placement="bottom">
      {children}
    </Dropdown>
  );
};

export default ContextMenu;
