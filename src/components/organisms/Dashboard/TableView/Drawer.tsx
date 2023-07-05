import {useLayoutEffect, useRef, useState} from 'react';
import {useClickAway} from 'react-use';

import {v4 as uuidv4} from 'uuid';

import {setActiveTab, setDashboardSelectedResourceId} from '@redux/dashboard/slice';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {useResource} from '@redux/selectors/resourceSelectors';

import {Logs, ResourceRefsIconPopover} from '@components/molecules';

import PodHandler from '@src/kindhandlers/Pod.handler';

import CodeEditor from '@editor/CodeEditor';
import {useWarnUnsavedChanges} from '@editor/editor.cluster';

import * as S from './Drawer.styled';
import GraphTab from './GraphTab';
import {InfoTab} from './InfoTab';
import ResourceActions from './ResourceActions';
import {TerminalTab} from './TerminalTab';

export const Drawer = () => {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(state => state.dashboard.ui.activeTab);
  const selectedResourceId = useAppSelector(state => state.dashboard.tableDrawer.selectedResourceId);
  const selectedResource = useResource(selectedResourceId ? {id: selectedResourceId, storage: 'cluster'} : undefined);
  const [isConfirmingUpdate, setIsConfirmingUpdate] = useState(false);

  const [warnUnsavedCodeChanges, UnsavedCodeChangesModal] = useWarnUnsavedChanges();

  const drawerClassName = useRef(uuidv4());
  const drawerRef = useRef<HTMLDivElement | null>(null);
  useClickAway(drawerRef, () => {
    if (!selectedResourceId || isConfirmingUpdate) return;
    warnUnsavedCodeChanges();
  });
  useLayoutEffect(() => {
    const elements = document.getElementsByClassName(drawerClassName.current);
    if (elements[0] instanceof HTMLDivElement) {
      drawerRef.current = elements[0];
    }
  }, [selectedResourceId]);

  return (
    <S.Drawer
      className={drawerClassName.current}
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
      <UnsavedCodeChangesModal />
      <S.TabsContainer>
        <S.Tabs
          tabBarExtraContent={
            <ResourceActions
              resource={selectedResource}
              isConfirmingUpdate={isConfirmingUpdate}
              setIsConfirmingUpdate={setIsConfirmingUpdate}
            />
          }
          defaultActiveKey={activeTab}
          activeKey={activeTab}
          onChange={(key: string) => {
            if (!warnUnsavedCodeChanges()) {
              dispatch(setActiveTab({tab: key as any, kind: selectedResource?.kind}));
            }
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
            {
              label: 'Graph',
              key: 'Graph',
              children: <GraphTab resource={selectedResource} />,
            },
          ]}
        />
      </S.TabsContainer>
    </S.Drawer>
  );
};
