import {Suspense} from 'react';

import Drawer from '@components/atoms/Drawer';

interface IProps {
  noPadding?: boolean;
  title: string;
  visible: boolean;
  onClose: () => void;
}

const LazyDrawer: React.FC<IProps> = props => {
  const {children, noPadding, title, visible, onClose} = props;

  return (
    <Drawer
      bodyStyle={noPadding ? {padding: 0} : {}}
      closable={false}
      noborder="true"
      placement="right"
      title={title}
      visible={visible}
      width="400"
      onClose={onClose}
    >
      {visible ? <Suspense fallback={null}>{children}</Suspense> : null}
    </Drawer>
  );
};

export default LazyDrawer;
