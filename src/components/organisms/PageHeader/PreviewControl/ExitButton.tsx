import {useCallback} from 'react';

import {Button} from 'antd';

import {CloseCircleFilled} from '@ant-design/icons';

import styled from 'styled-components';

import {useAppDispatch} from '@redux/hooks';
import {stopPreview} from '@redux/thunks/preview';

import {Colors} from '@shared/styles';

export function ExitButton() {
  const dispatch = useAppDispatch();

  const onClickExit = useCallback(() => {
    dispatch(stopPreview());
  }, [dispatch]);

  return (
    <CloseBtn onClick={onClickExit}>
      <CloseCircleFilled style={{fontSize: 16, display: 'block', textAlign: 'center', paddingTop: 4}} />
    </CloseBtn>
  );
}

const CloseBtn = styled(Button)`
  border-radius: 4px;
  padding: 0px;
  height: 30px;
  min-width: 20px;
  border: none;
  color: ${Colors.cyan6};
`;
