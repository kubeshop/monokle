import {useEffect, useState} from 'react';

import {Popover} from 'antd';

import {setSelectedResourceId} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {ResourceRefsIconPopover} from '@components/molecules';
import ErrorsPopoverContent from '@components/molecules/ValidationErrorsPopover/ErrorsPopoverContent';

import {K8sResource} from '@shared/models/k8sResource';

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
          <S.TitleContainer>
            <ResourceRefsIconPopover isSelected={false} isDisabled={false} resource={localResource} type="incoming" />
            <S.DrawerTitle>{localResource.name}</S.DrawerTitle>
            <ResourceRefsIconPopover isSelected={false} isDisabled={false} resource={localResource} type="outgoing" />

            {Number(localResource.validation?.errors.length) > 0 && (
              <Popover
                mouseEnterDelay={0.5}
                placement="rightTop"
                content={<ErrorsPopoverContent resource={localResource} />}
              >
                <S.ErrorCount>{localResource.validation?.errors.length}</S.ErrorCount>
              </Popover>
            )}
          </S.TitleContainer>
        ) : (
          <S.TitleContainer> - </S.TitleContainer>
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
              label: 'Manifest',
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
