import {useCallback, useEffect, useRef} from 'react';
import {useMeasure} from 'react-use';

import {FileOutlined, FolderOutlined} from '@ant-design/icons';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openCreateFileFolderModal, setExpandedFolders} from '@redux/reducers/ui';
import {isInClusterModeSelector, isInPreviewModeSelectorNew, selectedFilePathSelector} from '@redux/selectors';
import {useResourceMetaMapRef} from '@redux/selectors/resourceMapSelectors';
import {isHelmChartFile, isHelmTemplateFile, isHelmValuesFile} from '@redux/services/helm';
import {isKustomizationFilePath} from '@redux/services/kustomize';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {
  useCreate,
  useDelete,
  useDuplicate,
  useFileSelect,
  useFilterByFileOrFolder,
  useHighlightNode,
  usePreview,
  useProcessing,
  useRename,
} from '@hooks/fileTreeHooks';

import {sortFoldersFiles} from '@utils/fileExplorer';

import {Icon} from '@monokle/components';
import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {TreeNode} from '@shared/models/explorer';
import {isResourceSelection} from '@shared/models/selection';

import * as S from './FilePaneTree.styled';
import TreeItem from './TreeItem';

type IProps = {
  tree: TreeNode;
  treeRef: React.MutableRefObject<TreeNode | null>;
};

const FilePaneTree: React.FC<IProps> = props => {
  const {tree, treeRef} = props;

  const dispatch = useAppDispatch();
  const expandedFolders = useAppSelector(state => state.ui.leftMenu.expandedFolders);
  const fileExplorerSortOrder = useAppSelector(state => state.config.fileExplorerSortOrder);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelectorNew);
  const isPreviewLoading = useAppSelector(state => state.main.previewOptions.isLoading);
  const localResourceSelection = useAppSelector(state =>
    isResourceSelection(state.main.selection) && state.main.selection.resourceIdentifier.storage === 'local'
      ? state.main.selection
      : undefined
  );
  const localResourceMetaMapRef = useResourceMetaMapRef('local');
  const rootEntry = useAppSelector(state => state.main.fileMap[ROOT_FILE_ENTRY]);
  const selectedPath = useAppSelector(selectedFilePathSelector);

  const [containerRef, {height: containerHeight}] = useMeasure<HTMLDivElement>();

  const treeElementRef = useRef<any>();
  const highlightFilePath = useHighlightNode(tree, treeElementRef, expandedFolders);

  const setFolder = useCallback(
    (folder: string) => {
      dispatch(setRootFolder(folder));
    },
    [dispatch]
  );

  const refreshFolder = useCallback(() => {
    setFolder(rootEntry.filePath);
  }, [rootEntry?.filePath, setFolder]);

  const {onCreateResource} = useCreate();
  const {onDelete, processingEntity, setProcessingEntity} = useDelete();
  const {onDuplicate} = useDuplicate();
  const {onFileSelect} = useFileSelect();
  const {onFilterByFileOrFolder} = useFilterByFileOrFolder();
  const {onPreview} = usePreview();
  const {onExcludeFromProcessing, onIncludeToProcessing} = useProcessing(refreshFolder);
  const {onRename} = useRename();

  useEffect(() => {
    if (localResourceSelection && treeRef.current) {
      const resource = localResourceMetaMapRef.current[localResourceSelection.resourceIdentifier.id];

      if (resource) {
        const filePath = resource.origin.filePath;
        highlightFilePath(filePath);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localResourceSelection?.resourceIdentifier.id, treeRef]);

  return (
    <S.TreeContainer ref={containerRef}>
      <S.TreeDirectoryTree
        height={containerHeight}
        onSelect={onFileSelect}
        ref={treeElementRef}
        expandedKeys={expandedFolders}
        treeData={[sortFoldersFiles(fileExplorerSortOrder, tree)]}
        onExpand={expandedKeys => dispatch(setExpandedFolders(expandedKeys))}
        autoExpandParent={false}
        selectedKeys={[selectedPath || '-']}
        filterTreeNode={node => {
          // @ts-ignore
          return node.highlight;
        }}
        disabled={isInPreviewMode || isInClusterMode || isPreviewLoading}
        showIcon
        showLine={{showLeafIcon: false}}
        icon={(data: any) => {
          if (data.isFolder) {
            return <FolderOutlined />;
          }

          if (isKustomizationFilePath(data.filePath)) {
            return <Icon name="kustomize" style={{fontSize: 15}} />;
          }

          if (isHelmChartFile(data.filePath) || isHelmTemplateFile(data.filePath) || isHelmValuesFile(data.filePath)) {
            return <Icon name="helm" style={{fontSize: 18, paddingTop: '3px'}} />;
          }

          return <FileOutlined />;
        }}
        titleRender={(event: any) => (
          <TreeItem
            treeKey={String(event.key)}
            title={event.title}
            processingEntity={processingEntity}
            setProcessingEntity={setProcessingEntity}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onRename={onRename}
            onExcludeFromProcessing={onExcludeFromProcessing}
            onIncludeToProcessing={onIncludeToProcessing}
            onCreateFileFolder={(rootDir, type) => dispatch(openCreateFileFolderModal({rootDir, type}))}
            onCreateResource={onCreateResource}
            onFilterByFileOrFolder={onFilterByFileOrFolder}
            onPreview={onPreview}
            {...event}
          />
        )}
      />
    </S.TreeContainer>
  );
};

export default FilePaneTree;
