import {ReactNode, Suspense} from 'react';

import * as S from './LazyDrawer.styled';

interface IProps {
  noPadding?: boolean;
  title: string;
  visible: boolean;
  onClose: () => void;
  extra?: ReactNode;
  children: ReactNode;
}

const LazyDrawer: React.FC<IProps> = props => {
  const {children, noPadding, title, visible, onClose, ...rest} = props;

  return (
    <S.Drawer
      bodyStyle={noPadding ? {padding: 0} : {}}
      closable
      placement="right"
      title={title}
      open={visible}
      width={400}
      onClose={onClose}
      {...rest}
    >
      {visible ? <Suspense fallback={null}>{children}</Suspense> : null}
    </S.Drawer>
  );
};

export default LazyDrawer;
