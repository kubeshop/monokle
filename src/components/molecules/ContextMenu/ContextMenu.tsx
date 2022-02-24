import {Dropdown} from 'antd';

interface ContextMenuProps {
  overlay: React.ReactElement;
  triggerOnRightClick?: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = props => {
  const {overlay, children, triggerOnRightClick = false} = props;

  return (
    <Dropdown overlay={overlay} trigger={triggerOnRightClick ? ['contextMenu'] : ['click']} placement="bottomCenter">
      {children}
    </Dropdown>
  );
};

export default ContextMenu;
