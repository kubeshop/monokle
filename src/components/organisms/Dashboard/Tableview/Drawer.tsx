import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {useClickAway} from 'react-use';

import {LeftCircleFilled, RightCircleFilled} from '@ant-design/icons';

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
  const [isHalfScreen, setIsHalfScreen] = useState(true);
  const [isResizing, setIsResizing] = useState(false);
  const [width, setWidth] = useState(736);
  const layoutSize = useAppSelector(state => state.ui.layoutSize);
  const leftPaneSize = useAppSelector(state => state.ui.paneConfiguration.leftPane);
  const [height, setHeight] = useState<number>(window.innerHeight - layoutSize.header);
  const [maxWidth, setMaxWidth] = useState<number>(window.innerWidth - leftPaneSize);

  const onMouseDown = (e: any) => {
    setIsResizing(true);
  };

  const onMouseUp = (e: any) => {
    setIsResizing(false);
  };

  useEffect(() => {
    setHeight(window.innerHeight - layoutSize.header);
    setMaxWidth(window.innerWidth - leftPaneSize);
  }, [layoutSize, leftPaneSize]);

  const onMouseMove = (e: {clientX: number}) => {
    if (isResizing) {
      let offsetRight = document.body.offsetWidth - (e.clientX - document.body.offsetLeft);
      const minWidth = 600;
      if (offsetRight > minWidth && offsetRight < maxWidth) {
        setWidth(offsetRight);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  });

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

  const changeDrawerSize = () => {
    setIsHalfScreen(!isHalfScreen);
  };

  return (
    <S.Drawer
      className={drawerClassName.current}
      placement={isHalfScreen ? 'right' : 'top'}
      size="large"
      open={Boolean(selectedResourceId)}
      getContainer={false}
      width={width}
      height={height}
      title={
        selectedResource ? (
          <S.ArrowAndTitleContainer>
            <S.ArrowIconContainer onClick={changeDrawerSize}>
              {isHalfScreen && <LeftCircleFilled />}
              {!isHalfScreen && <RightCircleFilled />}
            </S.ArrowIconContainer>
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
          </S.ArrowAndTitleContainer>
        ) : (
          <S.TitleContainer> - </S.TitleContainer>
        )
      }
      onClose={() => {
        dispatch(setDashboardSelectedResourceId());
      }}
    >
      <S.DrawerSlider onMouseDown={onMouseDown} />
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
