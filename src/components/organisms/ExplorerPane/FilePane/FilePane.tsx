import {memo, useMemo} from 'react';

import {Button, CollapsePanelProps, Tooltip} from 'antd';

import AntdIcon, {ExclamationCircleOutlined, ReloadOutlined} from '@ant-design/icons';

import {TOOLTIP_DELAY} from '@constants/constants';
import {CollapseTreeTooltip, ExpandTreeTooltip, FileExplorerChanged, ReloadFolderTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setFileExplorerExpandedFolders} from '@redux/reducers/ui';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {AccordionPanel} from '@components/atoms';
import {CollapseIcon, ExpandIcon} from '@components/atoms/Icons';

import {useRefSelector} from '@utils/hooks';

import {TitleBar, TitleBarCount} from '@monokle/components';
import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {InjectedPanelProps} from '@shared/models/explorer';
import {trackEvent} from '@shared/utils';
import {isEqual} from '@shared/utils/isEqual';
import {isInClusterModeSelector} from '@shared/utils/selectors';

import * as S from './FilePane.styled';
import FileSystemTree from './FileSystemTree';
import {useSetFolderFromMainThread} from './useSetFolderFromMainThread';

const FilePane: React.FC<InjectedPanelProps> = props => {
  const {isActive, panelKey} = props;

  const dispatch = useAppDispatch();
  const fileExplorerExpandedFolders = useAppSelector(state => state.ui.fileExplorerExpandedFolders);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const isFolderLoading = useAppSelector(state => state.ui.isFolderLoading);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isScanExcludesUpdated = useAppSelector(state => state.config.isScanExcludesUpdated);
  const rootEntry = useAppSelector(state => state.main.fileMap[ROOT_FILE_ENTRY]);

  const filesOnly = useMemo(() => Object.values(fileMap).filter(f => !f.children), [fileMap]);
  const isButtonDisabled = useMemo(() => !rootEntry, [rootEntry]);
  const isCollapsed = useMemo(
    () => fileExplorerExpandedFolders.length === 0 || fileExplorerExpandedFolders.length === 1,
    [fileExplorerExpandedFolders]
  );
  const allFolderKeysRef = useRefSelector(state =>
    Object.values(state.main.fileMap)
      .filter(f => f.children && f.filePath !== f.rootFolderPath)
      .map(f => f.filePath)
  );

  useSetFolderFromMainThread();

  return (
    <AccordionPanel
      {...props}
      collapsible={isInClusterMode ? 'disabled' : undefined}
      showArrow={false}
      header={
        <TitleBar
          expandable
          isOpen={Boolean(isActive)}
          title="Files"
          actions={
            isActive ? (
              <S.TitleBarActions onClick={e => e.stopPropagation()}>
                {isScanExcludesUpdated === 'outdated' && (
                  <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={FileExplorerChanged}>
                    <ExclamationCircleOutlined />
                  </Tooltip>
                )}

                <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={ReloadFolderTooltip}>
                  <Button
                    size="small"
                    onClick={() => dispatch(setRootFolder({rootFolder: rootEntry.filePath, isReload: true}))}
                    icon={<ReloadOutlined />}
                    type="link"
                    disabled={isButtonDisabled}
                  />
                </Tooltip>

                <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={isCollapsed ? ExpandTreeTooltip : CollapseTreeTooltip}>
                  <Button
                    icon={isCollapsed ? <AntdIcon component={ExpandIcon} /> : <AntdIcon component={CollapseIcon} />}
                    onClick={() => {
                      dispatch(setFileExplorerExpandedFolders(isCollapsed ? allFolderKeysRef.current : []));
                      trackEvent(isCollapsed ? 'explore/expand_all' : 'explore/collapse_all');
                    }}
                    type="link"
                    size="small"
                    disabled={isButtonDisabled}
                  />
                </Tooltip>
              </S.TitleBarActions>
            ) : (
              <TitleBarCount count={filesOnly.length} isActive={false} />
            )
          }
          descriptionStyle={{paddingTop: '5px'}}
          description={
            <S.RootFolderText>
              {isFolderLoading ? (
                'Loading...'
              ) : (
                <>
                  <span id="file-explorer-count">
                    <b>{filesOnly.length || 0} files</b>
                  </span>{' '}
                  in <span id="file-explorer-project-name">{rootEntry?.filePath}</span>
                </>
              )}
            </S.RootFolderText>
          }
        />
      }
      key={panelKey as CollapsePanelProps['key']}
    >
      <S.FileTreeContainer>
        {isFolderLoading ? (
          <S.Skeleton active />
        ) : rootEntry ? (
          <FileSystemTree />
        ) : (
          <S.NoFilesContainer>
            Get started by selecting a folder containing manifests, kustomizations or Helm Charts.
          </S.NoFilesContainer>
        )}
      </S.FileTreeContainer>
    </AccordionPanel>
  );
};

export default memo(FilePane, isEqual);
