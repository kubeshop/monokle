import {useLayoutEffect, useRef} from 'react';
import {useMeasure} from 'react-use';

import {isString} from 'lodash';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectFile, selectHelmValuesFile} from '@redux/reducers/main';
import {setFileExplorerExpandedFolders} from '@redux/reducers/ui';
import {helmValuesMapByFilePathSelector, projectFileTreeSelector, selectionFilePathSelector} from '@redux/selectors';

import {getAllParentFolderPaths} from '@utils/files';
import {useSelectorWithRef} from '@utils/hooks';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {isFileSelection} from '@shared/models/selection';
import {isHelmValuesFile, trackEvent} from '@shared/utils';

import * as S from './FileSystemTree.styled';
import FileSystemTreeNode from './TreeNode';

const FileSystemTree: React.FC = () => {
  const dispatch = useAppDispatch();
  const [fileExplorerExpandedFolders, fileExplorerExpandedFoldersRef] = useSelectorWithRef(
    state => state.ui.fileExplorerExpandedFolders
  );
  const [helmValuesMapByFilePath] = useSelectorWithRef(helmValuesMapByFilePathSelector);
  const selectedFilePath = useAppSelector(selectionFilePathSelector);
  const [firstHighlightedFile, firstHighlightedFileRef] = useSelectorWithRef(state =>
    state.main.highlights.find(isFileSelection)
  );

  const [containerRef, {height: containerHeight}] = useMeasure<HTMLDivElement>();

  const treeRef = useRef<any>(null);

  const treeData = useAppSelector(projectFileTreeSelector);

  useLayoutEffect(() => {
    if (!firstHighlightedFile) {
      return;
    }

    const parentFolderPaths = getAllParentFolderPaths(firstHighlightedFile.filePath).filter(
      folderPath => !fileExplorerExpandedFoldersRef.current.includes(folderPath)
    );

    if (parentFolderPaths.length) {
      dispatch(
        setFileExplorerExpandedFolders([...new Set([...fileExplorerExpandedFoldersRef.current, ...parentFolderPaths])])
      );
    } else {
      treeRef.current?.scrollTo({key: firstHighlightedFile.filePath});
    }
  }, [dispatch, fileExplorerExpandedFoldersRef, firstHighlightedFile]);

  useLayoutEffect(() => {
    if (!firstHighlightedFileRef.current) {
      return;
    }

    setTimeout(() => {
      treeRef.current?.scrollTo({key: firstHighlightedFileRef.current?.filePath});
    }, 50);
  }, [fileExplorerExpandedFolders, firstHighlightedFileRef]);

  return (
    <S.TreeContainer ref={containerRef}>
      <S.TreeDirectoryTree
        $isHighlightSelection={Boolean(firstHighlightedFile)}
        ref={treeRef}
        expandedKeys={fileExplorerExpandedFolders}
        onExpand={(keys, info) => {
          if (info.node.key === ROOT_FILE_ENTRY) {
            return;
          }

          dispatch(
            setFileExplorerExpandedFolders(
              keys.filter(
                key => isString(key) && (info.expanded === true ? true : !key.startsWith(info.node.key as string))
              ) as string[]
            )
          );
        }}
        treeData={treeData}
        height={containerHeight - 100}
        titleRender={node => <FileSystemTreeNode node={node} />}
        selectedKeys={
          selectedFilePath ? [selectedFilePath] : firstHighlightedFile ? [firstHighlightedFile.filePath] : []
        }
        showIcon
        showLine={{showLeafIcon: false}}
        virtual
        onClick={(mouseEvent, nodeEvent) => {
          mouseEvent.preventDefault();
          if (nodeEvent.selectable === false || nodeEvent.key === ROOT_FILE_ENTRY) {
            return;
          }
          if (typeof nodeEvent.key === 'string' && !nodeEvent.disabled) {
            if (isHelmValuesFile(nodeEvent.key) && helmValuesMapByFilePath[nodeEvent.key]) {
              const valuesFileId = helmValuesMapByFilePath[nodeEvent.key].id;
              dispatch(selectHelmValuesFile({valuesFileId}));
              trackEvent('explore/select_values_file');
            } else {
              dispatch(selectFile({filePath: nodeEvent.key}));
              trackEvent('explore/select_file');
            }
          }
        }}
      />
    </S.TreeContainer>
  );
};

export default FileSystemTree;
