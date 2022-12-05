import {useEffect, useState} from 'react';

import {Popover} from 'antd';

import {K8sResource} from '@models/k8sresource';

import {setActiveTab, setSelectedResourceId} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {currentConfigSelector, kubeConfigContextSelector} from '@redux/selectors';
import {applyResource} from '@redux/thunks/applyResource';

import {ResourceRefsIconPopover} from '@components/molecules';
import ErrorsPopoverContent from '@components/molecules/ValidationErrorsPopover/ErrorsPopoverContent';

import * as S from './Drawer.styled';
import {EditorTab} from './EditorTab';
import {InfoTab} from './InfoTab';

export const Drawer = () => {
  const dispatch = useAppDispatch();
  const selectedResourceId = useAppSelector(state => state.dashboard.tableDrawer.selectedResourceId);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const [localResource, setLocalResource] = useState<K8sResource | undefined>();
  const activeTab = useAppSelector(state => state.dashboard.ui.activeTab);
  const projectConfig = useAppSelector(currentConfigSelector);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);

  useEffect(() => {
    if (selectedResourceId && resourceMap[selectedResourceId]) {
      setLocalResource(resourceMap[selectedResourceId]);
      return;
    }
    setLocalResource(undefined);
  }, [resourceMap, selectedResourceId]);

  const handleApplyResource = () => {
    if (localResource && localResource.namespace && selectedResourceId && resourceMap[selectedResourceId]) {
      applyResource(
        selectedResourceId,
        resourceMap,
        {},
        dispatch,
        projectConfig,
        kubeConfigContext,
        localResource.namespace ? {name: localResource.namespace, new: false} : undefined,
        {isClusterPreview: true}
      );
    }
  };

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

            {Number(Number(localResource.validation?.errors.length) + Number(localResource.issues?.errors.length)) >
              0 && (
              <Popover
                mouseEnterDelay={0.5}
                placement="rightTop"
                content={<ErrorsPopoverContent resource={localResource} />}
              >
                <S.ErrorCount>
                  {Number(
                    Number(localResource.validation?.errors.length) + Number(localResource.issues?.errors.length)
                  )}
                </S.ErrorCount>
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
          defaultActiveKey={activeTab}
          activeKey={activeTab}
          onChange={(key: string) => {
            dispatch(setActiveTab(key as any));
          }}
          items={[
            {
              label: 'Info',
              key: 'Info',
              children: <InfoTab resourceId={selectedResourceId as string} />,
            },
            {
              label: 'Manifest',
              key: 'Manifest',
              children: <EditorTab />,
            },
          ]}
        />
        <S.TabsFooter>
          <S.ActionButtons>
            {activeTab === 'Manifest' && (
              <S.ActionButton disabled={!localResource} onClick={() => handleApplyResource()}>
                Deploy
              </S.ActionButton>
            )}
          </S.ActionButtons>
        </S.TabsFooter>
      </S.TabsContainer>
    </S.Drawer>
  );
};
