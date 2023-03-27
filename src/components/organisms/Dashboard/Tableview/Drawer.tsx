import {setActiveTab, setDashboardSelectedResourceId} from '@redux/dashboard/slice';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {useResourceMetaMap} from '@redux/selectors/resourceMapSelectors';
import {useResource} from '@redux/selectors/resourceSelectors';
import {applyResourceToCluster} from '@redux/thunks/applyResource';

import {Logs, ResourceRefsIconPopover} from '@components/molecules';

import PodHandler from '@src/kindhandlers/Pod.handler';

import * as S from './Drawer.styled';
import {EditorTab} from './EditorTab';
import {InfoTab} from './InfoTab';
import {TerminalTab} from './TerminalTab';

export const Drawer = () => {
  const dispatch = useAppDispatch();
  const selectedResourceId = useAppSelector(state => state.dashboard.tableDrawer.selectedResourceId);
  const clusterResourceMetaMap = useResourceMetaMap('cluster');
  const activeTab = useAppSelector(state => state.dashboard.ui.activeTab);

  const selectedResource = useResource(selectedResourceId ? {id: selectedResourceId, storage: 'cluster'} : undefined);

  const handleApplyResource = () => {
    if (
      selectedResource &&
      selectedResource.namespace &&
      selectedResourceId &&
      clusterResourceMetaMap[selectedResourceId]
    ) {
      dispatch(
        applyResourceToCluster({
          resourceIdentifier: {
            id: selectedResourceId,
            storage: 'cluster',
          },
          namespace: selectedResource.namespace ? {name: selectedResource.namespace, new: false} : undefined,
          options: {
            isInClusterMode: true,
          },
        })
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
        selectedResource ? (
          <S.TitleContainer>
            <ResourceRefsIconPopover
              isSelected={false}
              isDisabled={false}
              resourceMeta={selectedResource}
              type="incoming"
            />
            <S.DrawerTitle>{selectedResource.name}</S.DrawerTitle>
            <ResourceRefsIconPopover
              isSelected={false}
              isDisabled={false}
              resourceMeta={selectedResource}
              type="outgoing"
            />
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
            ...(selectedResource?.kind === PodHandler.kind
              ? [
                  {
                    label: 'Logs',
                    key: 'Logs',
                    children: <Logs />,
                  },
                  ...(selectedResource.object.status.phase === 'Running'
                    ? [
                        {
                          label: 'Shell',
                          key: 'Shell',
                          children: <TerminalTab resourceId={selectedResourceId as string} />,
                        },
                      ]
                    : []),
                ]
              : []),
          ]}
        />
        <S.TabsFooter>
          <S.ActionButtons>
            {activeTab === 'Manifest' && (
              <S.ActionButton disabled={!selectedResource} onClick={() => handleApplyResource()}>
                Update
              </S.ActionButton>
            )}
          </S.ActionButtons>
        </S.TabsFooter>
      </S.TabsContainer>
    </S.Drawer>
  );
};
