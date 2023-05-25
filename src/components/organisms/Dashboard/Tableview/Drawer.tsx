import {setActiveTab, setDashboardSelectedResourceId} from '@redux/dashboard/slice';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {useResource} from '@redux/selectors/resourceSelectors';

import {Logs, ResourceRefsIconPopover} from '@components/molecules';

import PodHandler from '@src/kindhandlers/Pod.handler';

import CodeEditor from '@editor/CodeEditor';

import * as S from './Drawer.styled';
import {InfoTab} from './InfoTab';
import ResourceActions from './ResourceActions';
import {TerminalTab} from './TerminalTab';

export const Drawer = () => {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(state => state.dashboard.ui.activeTab);
  const selectedResourceId = useAppSelector(state => state.dashboard.tableDrawer.selectedResourceId);

  const selectedResource = useResource(selectedResourceId ? {id: selectedResourceId, storage: 'cluster'} : undefined);

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
          tabBarExtraContent={<ResourceActions resource={selectedResource} />}
          defaultActiveKey={activeTab}
          activeKey={activeTab}
          onChange={(key: string) => {
            dispatch(setActiveTab({tab: key as any, kind: selectedResource?.kind}));
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
              children: <CodeEditor type="cluster" />,
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
      </S.TabsContainer>
    </S.Drawer>
  );
};
