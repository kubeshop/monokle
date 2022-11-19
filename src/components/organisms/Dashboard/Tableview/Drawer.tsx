import {useEffect, useState} from 'react';

import {K8sResource} from '@models/k8sresource';

import {setSelectedResourceId} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import * as S from './Drawer.styled';

export const Drawer = () => {
  const dispatch = useAppDispatch();
  const selectedResourceId = useAppSelector(state => state.dashboard.tableDrawer.selectedResourceId);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const [localResource, setLocalResource] = useState<K8sResource | undefined>();

  useEffect(() => {
    if (selectedResourceId && resourceMap[selectedResourceId]) {
      setLocalResource(resourceMap[selectedResourceId]);
      return;
    }
    setLocalResource(undefined);
  }, [resourceMap, selectedResourceId]);

  return (
    <S.Drawer
      placement="right"
      size="large"
      open={Boolean(selectedResourceId)}
      getContainer={false}
      title={<S.DrawerTitle>{localResource?.name}</S.DrawerTitle>}
      onClose={() => {
        dispatch(setSelectedResourceId());
      }}
    >
      <S.TabsContainer>
        <S.Tabs defaultActiveKey="1">
          <S.Tabs.TabPane tab="Info" key="1">
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
            <p>Some contents...</p>{' '}
          </S.Tabs.TabPane>
          <S.Tabs.TabPane tab="Code" key="2">
            <p>Some contents1...</p>
            <p>Some contents1...</p>
            <p>Some contents1...</p>
            <p>Some contents1...</p>
            <p>Some contents1...</p>
            <p>Some contents1...</p>
            <p>Some contents1...</p>
            <p>Some contents1...</p>
            <p>Some contents1...</p>
            <p>Some contents1...</p>
            <p>Some contents1...</p>
            <p>Some contents1...</p>
            <p>Some contents1...</p>
            <p>Some contents1...</p>
            <p>Some contents1...</p>
            <p>Some contents1...</p>
            <p>Some contents1...</p>
            <p>Some contents1...</p>
            <p>Some contents1...</p>
            <p>Some contents1...</p>
          </S.Tabs.TabPane>
        </S.Tabs>
        <S.TabsFooter>
          <S.NavigationButton>
            <S.LeftOutlined />
          </S.NavigationButton>
          <S.NavigationButton>
            <S.RightOutlined />
          </S.NavigationButton>
        </S.TabsFooter>
      </S.TabsContainer>
    </S.Drawer>
  );
};
