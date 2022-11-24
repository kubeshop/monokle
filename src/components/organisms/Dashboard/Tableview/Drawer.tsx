import {useEffect, useState} from 'react';

import {K8sResource} from '@models/k8sresource';

import {setSelectedResourceId} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {ResourceRefsIconPopover} from '@components/molecules';

import * as S from './Drawer.styled';
import {EditorTab} from './EditorTab';
import {InfoTab} from './InfoTab';

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
      title={
        localResource ? (
          <div style={{display: 'flex'}}>
            <ResourceRefsIconPopover isSelected={false} isDisabled={false} resource={localResource} type="incoming" />
            <S.DrawerTitle>{localResource.name}</S.DrawerTitle>
            <ResourceRefsIconPopover isSelected={false} isDisabled={false} resource={localResource} type="outgoing" />
          </div>
        ) : (
          <div> - </div>
        )
      }
      onClose={() => {
        dispatch(setSelectedResourceId());
      }}
    >
      <S.TabsContainer>
        <S.Tabs
          defaultActiveKey="1"
          items={[
            {
              label: 'Info',
              key: '1',
              children: <InfoTab resourceId={selectedResourceId as string} />,
            },
            {
              label: 'Code',
              key: '2',
              children: <EditorTab />,
            },
          ]}
        />
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
