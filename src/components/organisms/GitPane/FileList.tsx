import {useCallback, useEffect, useState} from 'react';

import {Checkbox, Dropdown, List, Modal, Space, Tooltip} from 'antd';
import {CheckboxChangeEvent} from 'antd/lib/checkbox';

import {TOOLTIP_DELAY} from '@constants/constants';

import {setGitLoading, setSelectedItem} from '@redux/git';
import {stageChangedFiles, unstageFiles} from '@redux/git/git.ipc';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {clearSelection, selectFile} from '@redux/reducers/main';
import {selectedFilePathSelector} from '@redux/selectors';
import {updateFileEntry} from '@redux/thunks/updateFileEntry';

import {Dots} from '@components/atoms';

import {createFileWithContent} from '@utils/files';
import {showGitErrorModal} from '@utils/terminal';

import {AlertEnum} from '@shared/models/alert';
import {GitChangedFile} from '@shared/models/git';
import {Colors} from '@shared/styles/colors';
import {deleteFile} from '@shared/utils/fileSystem';
import {isEqual} from '@shared/utils/isEqual';

import * as S from './FileList.styled';

type IProps = {
  files: GitChangedFile[];
  selectedFiles: GitChangedFile[];
  handleSelect: (e: CheckboxChangeEvent, item: GitChangedFile) => void;
};

const FileList: React.FC<IProps> = props => {
  const {files, selectedFiles, handleSelect} = props;

  const dispatch = useAppDispatch();
  const changedFiles = useAppSelector(state => state.git.changedFiles);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const fileOrFolderContainedInFilter = useAppSelector(state => state.main.resourceFilter.fileOrFolderContainedIn);
  const selectedFilePath = useAppSelector(selectedFilePathSelector);
  const selectedGitFile = useAppSelector(state => state.git.selectedItem);
  const selectedProjectRootFolder = useAppSelector(state => state.config.selectedProjectRootFolder);

  const [hovered, setHovered] = useState<GitChangedFile | null>(null);

  const discardTitle = useCallback((item: GitChangedFile) => {
    switch (item.type) {
      case 'added':
      case 'untracked':
        return `Are you sure you want to delete ${item.name}? The file will be completely lost!`;
      case 'modified':
        return `Are you sure you want to discard changes in ${item.name}?`;
      case 'deleted':
        return `Are you sure you want to restore ${item.name}?`;
      default:
        return '';
    }
  }, []);

  const renderMenuItems = useCallback(
    (item: GitChangedFile) => [
      {
        key: 'stage_unstage_changes',
        label: item.status === 'staged' ? 'Unstage changes' : 'Stage changes',
        onClick: async () => {
          if (!selectedProjectRootFolder) return;

          dispatch(setGitLoading(true));

          if (item.status === 'unstaged') {
            try {
              await stageChangedFiles({localPath: selectedProjectRootFolder, filePaths: [item.fullGitPath]});
            } catch (e) {
              showGitErrorModal(
                'Staging changes failed!',
                undefined,
                `git add ${[item.fullGitPath].join(' ')}`,
                dispatch
              );
              setGitLoading(false);
            }
          } else {
            try {
              await unstageFiles({localPath: selectedProjectRootFolder, filePaths: [item.fullGitPath]});
            } catch (e) {
              showGitErrorModal(
                'Unstage changes failed!',
                undefined,
                `git reset ${[item.fullGitPath].join(' ')}`,
                dispatch
              );
              setGitLoading(false);
            }
          }
        },
      },
      ...(item.status === 'unstaged'
        ? [
            {
              key: 'discard_changes',
              label: 'Discard changes',
              onClick: () => {
                Modal.confirm({
                  title: discardTitle(item),
                  async onOk() {
                    dispatch(setGitLoading(true));

                    try {
                      if (item.type === 'modified') {
                        dispatch(updateFileEntry({path: item.path, text: item.originalContent}));
                      } else if (item.type === 'added' || item.type === 'untracked') {
                        await deleteFile(item.fullGitPath);
                      } else if (item.type === 'deleted') {
                        createFileWithContent(item.fullGitPath, item.originalContent);
                      }
                    } catch (e) {
                      dispatch(setGitLoading(false));
                      dispatch(setAlert({title: 'Discard changes failed!', message: '', type: AlertEnum.Error}));
                    }
                  },
                  onCancel() {},
                });
              },
            },
          ]
        : []),
    ],
    [discardTitle, dispatch, selectedProjectRootFolder]
  );

  const selectItemHandler = (item: GitChangedFile) => {
    if (
      selectedGitFile?.fullGitPath !== item.fullGitPath ||
      (selectedGitFile?.fullGitPath === item.fullGitPath && selectedGitFile?.status !== item.status)
    ) {
      dispatch(setSelectedItem(item));
    }

    if (
      item.modifiedContent &&
      fileMap[item.path] &&
      !fileMap[item.path].isExcluded &&
      fileMap[item.path].filePath.startsWith(fileOrFolderContainedInFilter || '')
    ) {
      dispatch(selectFile({filePath: item.path}));
    } else if (selectedFilePath) {
      dispatch(clearSelection());
    }
  };

  const isSelected = (item: GitChangedFile) => {
    return selectedGitFile?.fullGitPath === item.fullGitPath && selectedGitFile?.status === item.status;
  };

  useEffect(() => {
    if (!selectedGitFile) {
      return;
    }

    const foundFile = changedFiles.find(
      f => f.fullGitPath === selectedGitFile.fullGitPath && f.status === selectedGitFile.status
    );

    if (!foundFile) {
      const foundNewFile = changedFiles.find(f => f.fullGitPath === selectedGitFile.fullGitPath);

      if (foundNewFile) {
        dispatch(setSelectedItem(foundNewFile));
      } else {
        dispatch(setSelectedItem(undefined));
      }
    } else if (!isEqual(foundFile, selectedGitFile)) {
      dispatch(setSelectedItem(foundFile));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changedFiles]);

  return (
    <S.List
      dataSource={files}
      renderItem={item => (
        <List.Item
          onMouseEnter={() => setHovered(item)}
          onMouseLeave={() => setHovered(null)}
          style={{
            background: isSelected(item)
              ? Colors.selectionColor
              : selectedFiles.find(
                  searchItem => searchItem.fullGitPath === item.fullGitPath && searchItem.status === item.status
                )
              ? 'rgba(255, 255, 255, 0.07)'
              : 'transparent',
          }}
          onClick={() => {
            selectItemHandler(item);
          }}
        >
          <Checkbox
            onChange={e => handleSelect(e, item)}
            checked={Boolean(
              selectedFiles.find(
                searchItem => searchItem.name === item.name && searchItem.displayPath === item.displayPath
              )
            )}
          />

          <S.FileItem>
            <S.FileItemData $isSelected={isSelected(item)}>
              <S.FileIcon>
                <S.FileOutlined $isSelected={isSelected(item)} $type={item.status} />
              </S.FileIcon>
              <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={item.type.charAt(0).toUpperCase() + item.type.slice(1)}>
                <S.FileStatus $type={item.type} />
              </Tooltip>
              <S.FileName>{item.name}</S.FileName>
              <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={item.path}>
                <S.FilePath $isSelected={isSelected(item)}>{item.displayPath}</S.FilePath>
              </Tooltip>
            </S.FileItemData>

            <S.FileItemOperations
              onClick={e => {
                e.stopPropagation();
              }}
            >
              {hovered?.name === item.name && hovered?.path === item.path && (
                <Dropdown menu={{items: renderMenuItems(item)}} trigger={['click']}>
                  <Space>
                    <Dots color={isSelected(item) ? Colors.blackPure : Colors.blue6} />
                  </Space>
                </Dropdown>
              )}
            </S.FileItemOperations>
          </S.FileItem>
        </List.Item>
      )}
    />
  );
};

export default FileList;
