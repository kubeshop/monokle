import {setSelectedResourceId} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import * as S from './Drawer.styled';

export const Drawer = () => {
  const dispatch = useAppDispatch();
  const selectedResourceId = useAppSelector(state => state.dashboard.tableDrawer.selectedResourceId);

  return (
    <S.Drawer
      placement="right"
      size="large"
      open={Boolean(selectedResourceId)}
      getContainer={false}
      title="sadfdf"
      onClose={() => {
        dispatch(setSelectedResourceId());
      }}
    >
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
    </S.Drawer>
  );
};
