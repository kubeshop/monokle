import {ipcRenderer} from 'electron';

import {memo, useCallback, useEffect, useMemo} from 'react';

import {Button, CollapsePanelProps, Tooltip} from 'antd';

import {ExclamationCircleOutlined, ReloadOutlined} from '@ant-design/icons';

import log from 'loglevel';
import path from 'path';

import {TOOLTIP_DELAY} from '@constants/constants';
import {CollapseTreeTooltip, ExpandTreeTooltip, FileExplorerChanged, ReloadFolderTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setExpandedFolders} from '@redux/reducers/ui';
import {settingsSelector} from '@redux/selectors';
import {useResourceMetaMapRef} from '@redux/selectors/resourceMapSelectors';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {useTreeKeys} from '@hooks/fileTreeHooks/useTreeKeys';

import {useStateWithRef} from '@utils/hooks';

import {Icon, TitleBar, TitleBarCount} from '@monokle/components';
import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {InjectedPanelProps, TreeNode} from '@shared/models/explorer';

import AccordionPanel from '../AccordionPanel';
import {AccordionTitleBarContainer} from '../AccordionPanel/AccordionTitleBarContainer';
import {createNode} from './CreateNode';
import * as S from './FilePane.styled';
import FilePaneTree from './FilePaneTree';

const FilePane: React.FC<InjectedPanelProps> = props => {
  const {isActive, panelKey} = props;

  const dispatch = useAppDispatch();
  const expandedFolders = useAppSelector(state => state.ui.leftMenu.expandedFolders);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const fileOrFolderContainedInFilter = useAppSelector(state => state.main.resourceFilter.fileOrFolderContainedIn);
  const isFolderLoading = useAppSelector(state => state.ui.isFolderLoading);
  const isScanExcludesUpdated = useAppSelector(state => state.config.isScanExcludesUpdated);
  const localResourceMetaMapRef = useResourceMetaMapRef('local');
  const rootEntry = useAppSelector(state => state.main.fileMap[ROOT_FILE_ENTRY]);
  const {hideExcludedFilesInFileExplorer, hideUnsupportedFilesInFileExplorer} = useAppSelector(settingsSelector);

  const [tree, setTree, treeRef] = useStateWithRef<TreeNode | null>(null);

  const allTreeKeys = useTreeKeys(tree);
  const filesOnly = useMemo(() => Object.values(fileMap).filter(f => !f.children), [fileMap]);
  const isButtonDisabled = useMemo(() => !rootEntry, [rootEntry]);
  const isCollapsed = useMemo(() => expandedFolders.length === 0 || expandedFolders.length === 1, [expandedFolders]);
  const rootFolderName = useMemo(() => (rootEntry ? path.basename(rootEntry.filePath) : ROOT_FILE_ENTRY), [rootEntry]);

  const setFolder = useCallback(
    (folder: string) => {
      dispatch(setRootFolder(folder));
    },
    [dispatch]
  );

  const onSelectRootFolderFromMainThread = useCallback(
    (_: any, data: string) => {
      if (data) {
        log.info('setting root folder from main thread', data);
        setFolder(data);
      }
    },
    [setFolder]
  );

  useEffect(() => {
    if (isFolderLoading) {
      setTree(null);
      return;
    }

    const treeData =
      rootEntry &&
      createNode(
        rootEntry,
        fileMap,
        localResourceMetaMapRef.current,
        Boolean(hideExcludedFilesInFileExplorer),
        Boolean(hideUnsupportedFilesInFileExplorer),
        fileOrFolderContainedInFilter,
        rootFolderName
      );

    setTree(treeData);
  }, [
    isFolderLoading,
    localResourceMetaMapRef,
    fileMap,
    hideExcludedFilesInFileExplorer,
    hideUnsupportedFilesInFileExplorer,
    fileOrFolderContainedInFilter,
    rootFolderName,
    dispatch,
    rootEntry,
    setTree,
  ]);

  // called from main thread because thunks cannot be dispatched by main
  useEffect(() => {
    ipcRenderer.on('set-root-folder', onSelectRootFolderFromMainThread);
    return () => {
      ipcRenderer.removeListener('set-root-folder', onSelectRootFolderFromMainThread);
    };
  }, [onSelectRootFolderFromMainThread]);

  return (
    <AccordionPanel
      {...props}
      showArrow={false}
      header={
        <AccordionTitleBarContainer>
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
                      onClick={() => dispatch(setRootFolder(rootEntry.filePath))}
                      icon={<ReloadOutlined />}
                      type="link"
                      disabled={isButtonDisabled}
                    />
                  </Tooltip>
                  <Tooltip
                    mouseEnterDelay={TOOLTIP_DELAY}
                    title={isCollapsed ? ExpandTreeTooltip : CollapseTreeTooltip}
                  >
                    <Button
                      icon={<Icon name="collapse" />}
                      onClick={() => dispatch(setExpandedFolders(isCollapsed ? allTreeKeys : tree ? [tree.key] : []))}
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
            description={
              <S.RootFolderText>
                <span id="file-explorer-count">
                  <b>{filesOnly.length || 0} files</b>
                </span>{' '}
                in <span id="file-explorer-project-name">{rootEntry?.filePath}</span>
              </S.RootFolderText>
            }
          />
        </AccordionTitleBarContainer>
      }
      key={panelKey as CollapsePanelProps['key']}
    >
      <S.FileTreeContainer>
        {isFolderLoading ? (
          <S.Skeleton active />
        ) : tree ? (
          <FilePaneTree tree={tree} treeRef={treeRef} />
        ) : (
          <S.NoFilesContainer>
            Get started by selecting a folder containing manifests, kustomizations or Helm Charts.
          </S.NoFilesContainer>
        )}
      </S.FileTreeContainer>
    </AccordionPanel>
  );
};

export default memo(FilePane);
