import {useEffect, useState} from 'react';

import {setActiveTab, setDashboardSelectedResourceId} from '@redux/dashboard/slice';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {currentConfigSelector} from '@redux/selectors';
import {useResourceMap} from '@redux/selectors/resourceMapSelectors';
import {applyResource} from '@redux/thunks/applyResource';

import {Logs, ResourceRefsIconPopover} from '@components/molecules';

import PodHandler from '@src/kindhandlers/Pod.handler';

import {K8sResource} from '@shared/models/k8sResource';
import {kubeConfigContextSelector} from '@shared/utils/selectors';

import * as S from './Drawer.styled';
import {EditorTab} from './EditorTab';
import {InfoTab} from './InfoTab';
import {TerminalTab} from './TerminalTab';

export const Drawer = () => {
  const dispatch = useAppDispatch();
  const selectedResourceId = useAppSelector(state => state.dashboard.tableDrawer.selectedResourceId);
  const clusterResourceMap = useResourceMap('cluster');
  const [localResource, setLocalResource] = useState<K8sResource | undefined>();
  const activeTab = useAppSelector(state => state.dashboard.ui.activeTab);
  const projectConfig = useAppSelector(currentConfigSelector);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);

  useEffect(() => {
    if (selectedResourceId && clusterResourceMap[selectedResourceId]) {
      setLocalResource(clusterResourceMap[selectedResourceId]);
      return;
    }
    setLocalResource(undefined);
  }, [clusterResourceMap, selectedResourceId]);

  const handleApplyResource = () => {
    if (localResource && localResource.namespace && selectedResourceId && clusterResourceMap[selectedResourceId]) {
      applyResource(
        selectedResourceId,
        clusterResourceMap,
        {},
        dispatch,
        projectConfig,
        kubeConfigContext,
        localResource.namespace ? {name: localResource.namespace, new: false} : undefined,
        {isInClusterMode: true}
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
            <ResourceRefsIconPopover
              isSelected={false}
              isDisabled={false}
              resourceMeta={localResource}
              type="incoming"
            />
            <S.DrawerTitle>{localResource.name}</S.DrawerTitle>
            <ResourceRefsIconPopover
              isSelected={false}
              isDisabled={false}
              resourceMeta={localResource}
              type="outgoing"
            />

            {/*
              // TODO: revisit this after @monokle/validation
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
            )} */}
          </S.TitleContainer>
        ) : (
          <S.TitleContainer> - </S.TitleContainer>
        )
      }
      onClose={() => {
        dispatch(setDashboardSelectedResourceId());
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
            ...(localResource?.kind === PodHandler.kind
              ? [
                  {
                    label: 'Logs',
                    key: 'Logs',
                    children: <Logs />,
                  },
                  {
                    label: 'Shell',
                    key: 'Shell',
                    children: <TerminalTab resourceId={selectedResourceId as string} />,
                  },
                ]
              : []),
          ]}
        />
        <S.TabsFooter>
          <S.ActionButtons>
            {activeTab === 'Manifest' && (
              <S.ActionButton disabled={!localResource} onClick={() => handleApplyResource()}>
                Update
              </S.ActionButton>
            )}
          </S.ActionButtons>
        </S.TabsFooter>
      </S.TabsContainer>
    </S.Drawer>
  );
};
