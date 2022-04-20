import {Button} from 'antd';

import {useAppDispatch} from '@redux/hooks';
import {toggleValidationDrawer} from '@redux/reducers/ui';

import * as S from './ValidationDrawerHeading.styled';

export function DrawerHeading({title, closable = true}: {title: string; closable?: boolean}) {
  const dispatch = useAppDispatch();

  return (
    <S.DrawerHeadingContainer>
      <S.DrawerTitle>{title}</S.DrawerTitle>

      {closable && (
        <Button id="pane-close" onClick={() => dispatch(toggleValidationDrawer())} type="link" size="small">
          <S.ArrowIcon />
        </Button>
      )}
    </S.DrawerHeadingContainer>
  );
}
