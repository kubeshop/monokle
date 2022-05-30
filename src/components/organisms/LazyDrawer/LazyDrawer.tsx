import {ReactNode, Suspense} from 'react';

import * as S from './styled';

interface IProps {
  noPadding?: boolean;
  title: string;
  visible: boolean;
  onClose: () => void;
  extra?: ReactNode;
}

const LazyDrawer: React.FC<IProps> = props => {
  const {children, noPadding, title, visible, onClose, ...rest} = props;

  return (
    <S.StyledDrawer
      bodyStyle={noPadding ? {padding: 0} : {}}
      closable={false}
      noborder="true"
      placement="right"
      title={title}
      visible={visible}
      width="400"
      onClose={onClose}
      {...rest}
    >
      {visible ? <Suspense fallback={null}>{children}</Suspense> : null}
    </S.StyledDrawer>
  );
};

export default LazyDrawer;
