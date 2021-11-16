import {Dropdown} from 'antd';

interface ContextMenuProps {
  overlay: React.ReactElement;
}

const ContextMenu: React.FC<ContextMenuProps> = props => {
  const {overlay, children} = props;

  return (
    <Dropdown overlay={overlay} trigger={['click', 'hover']} placement="bottomCenter">
      {children}
    </Dropdown>
  );
};

export default ContextMenu;
