import {useCallback, useState} from 'react';

import {Checkbox, Dropdown, List, Menu, Modal, Space, Tooltip} from 'antd';
import {CheckboxChangeEvent} from 'antd/lib/checkbox';

import {TOOLTIP_DELAY} from '@constants/constants';

import {AlertEnum} from '@models/alert';
import {GitChangedFile} from '@models/git';

import {setSelectedItem} from '@redux/git';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {clearSelectedPath, selectFile} from '@redux/reducers/main';
import {updateFileEntry} from '@redux/thunks/updateFileEntry';

import {Dots} from '@components/atoms';

import {deleteFile} from '@utils/fileSystem';
import {createFileWithContent} from '@utils/files';
import {promiseFromIpcRenderer} from '@utils/promises';

import Colors from '@styles/Colors';

import * as S from './FileList.styled';

type IProps = {
  files: GitChangedFile[];
  selectedFiles: GitChangedFile[];
  handleSelect: (e: CheckboxChangeEvent, item: GitChangedFile) => void;
};

const FileList: React.FC<IProps> = props => {
  const {files, selectedFiles, handleSelect} = props;

  const dispatch = useAppDispatch();
  const fileMap = useAppSelector(state => state.main.fileMap);
  const fileOrFolderContainedInFilter = useAppSelector(state => state.main.resourceFilter.fileOrFolderContainedIn);
  const selectedGitFile = useAppSelector(state => state.git.selectedItem);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
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
        onClick: () => {
          if (item.status === 'unstaged') {
            promiseFromIpcRenderer('git.stageChangedFiles', 'git.stageChangedFiles.result', {
              localPath: selectedProjectRootFolder,
              filePaths: [item.fullGitPath],
            });
          } else {
            promiseFromIpcRenderer('git.unstageFiles', 'git.unstageFiles.result', {
              localPath: selectedProjectRootFolder,
              filePaths: [item.fullGitPath],
            });
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
                  onOk() {
                    try {
                      if (item.type === 'modified') {
                        dispatch(updateFileEntry({path: item.path, text: item.originalContent}));
                      } else if (item.type === 'added' || item.type === 'untracked') {
                        deleteFile(item.fullGitPath);
                      } else if (item.type === 'deleted') {
                        createFileWithContent(item.fullGitPath, item.originalContent);
                      }
                    } catch (e) {
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
    if (selectedGitFile?.fullGitPath !== item.fullGitPath) {
      dispatch(setSelectedItem(item));
    }

    if (
      item.modifiedContent &&
      fileMap[item.path] &&
      fileMap[item.path].isSupported &&
      !fileMap[item.path].isExcluded &&
      fileMap[item.path].filePath.startsWith(fileOrFolderContainedInFilter || '')
    ) {
      dispatch(selectFile({filePath: item.path}));
    } else if (selectedPath) {
      dispatch(clearSelectedPath());
    }
  };

  return (
    <S.List
      dataSource={files}
      renderItem={item => (
        <List.Item
          onMouseEnter={() => setHovered(item)}
          onMouseLeave={() => setHovered(null)}
          style={{
            background:
              selectedGitFile?.fullGitPath === item.fullGitPath
                ? Colors.selectionGradient
                : selectedFiles.find(searchItem => searchItem.fullGitPath === item.fullGitPath)
                ? 'rgba(255, 255, 255, 0.07)'
                : 'transparent',
          }}
          onClick={() => {
            selectItemHandler(item);
          }}
        >
          <Checkbox
            onChange={e => handleSelect(e, item)}
            checked={Boolean(selectedFiles.find(searchItem => searchItem.name === item.name))}
          />

          <S.FileItem>
            <S.FileItemData $isSelected={selectedGitFile?.fullGitPath === item.fullGitPath}>
              <S.FileIcon>
                <S.FileOutlined $isSelected={selectedGitFile?.fullGitPath === item.fullGitPath} $type={item.status} />
              </S.FileIcon>
              <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={item.type.charAt(0).toUpperCase() + item.type.slice(1)}>
                <S.FileStatus $type={item.type} />
              </Tooltip>
              <S.FileName>{item.name}</S.FileName>
              <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={item.path}>
                <S.FilePath $isSelected={selectedGitFile?.fullGitPath === item.fullGitPath}>
                  {item.displayPath}
                </S.FilePath>
              </Tooltip>
            </S.FileItemData>

            <S.FileItemOperations
              onClick={e => {
                e.stopPropagation();
              }}
            >
              {hovered?.name === item.name && hovered?.path === item.path && (
                <Dropdown overlay={<Menu items={renderMenuItems(item)} />} trigger={['click']}>
                  <Space>
                    <Dots color={selectedGitFile?.fullGitPath === item.fullGitPath ? Colors.blackPure : Colors.blue6} />
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
