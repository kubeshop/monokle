import {useCallback, useState} from 'react';

import {Checkbox, Dropdown, List, Menu, Space} from 'antd';
import {CheckboxChangeEvent} from 'antd/lib/checkbox';

import {GitChangedFile} from '@models/git';

import {setSelectedItem} from '@redux/git';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {Dots} from '@components/atoms';

import {promiseFromIpcRenderer} from '@utils/promises';

import * as S from './FileList.styled';

type IProps = {
  files: GitChangedFile[];
  selectedFiles: GitChangedFile[];
  handleSelect: (e: CheckboxChangeEvent, item: GitChangedFile) => void;
};

const FileList: React.FC<IProps> = props => {
  const {files, selectedFiles, handleSelect} = props;

  const dispatch = useAppDispatch();
  const selectedProjectRootFolder = useAppSelector(state => state.config.selectedProjectRootFolder);

  const [hovered, setHovered] = useState<GitChangedFile | null>(null);

  const renderMenuItems = useCallback(
    (item: GitChangedFile) => [
      {
        key: 'stage_unstage_changes',
        label: files[0].status === 'staged' ? 'Unstage changes' : 'Stage changes',
        onClick: () => {
          if (!files?.length) {
            return;
          }

          if (files[0].status === 'unstaged') {
            promiseFromIpcRenderer('git.stageChangedFiles', 'git.stageChangedFiles.result', {
              localPath: selectedProjectRootFolder,
              filePaths: [item.path],
            });
          } else {
            promiseFromIpcRenderer('git.unstageFiles', 'git.unstageFiles.result', {
              localPath: selectedProjectRootFolder,
              filePaths: [item.path],
            });
          }
        },
      },
    ],
    [files, selectedProjectRootFolder]
  );

  return (
    <S.List
      dataSource={files}
      renderItem={item => (
        <List.Item
          onMouseEnter={() => setHovered(item)}
          onMouseLeave={() => setHovered(null)}
          style={{
            background: selectedFiles.find(searchItem => searchItem.name === item.name) && 'rgba(255, 255, 255, 0.07)',
          }}
        >
          <Checkbox
            onChange={e => handleSelect(e, item)}
            checked={Boolean(selectedFiles.find(searchItem => searchItem.name === item.name))}
          />

          <S.FileItem>
            <S.FileItemData onClick={() => dispatch(setSelectedItem(item))}>
              <S.FileIcon>
                <S.FileOutlined $type={item.status} />
              </S.FileIcon>
              {item.name}
              <S.FilePath>{item.path}</S.FilePath>
            </S.FileItemData>

            {hovered?.name === item.name && hovered.path === item.path && (
              <Dropdown overlay={<Menu items={renderMenuItems(item)} />} trigger={['click']}>
                <Space onClick={e => e.preventDefault()}>
                  <Dots />
                </Space>
              </Dropdown>
            )}
          </S.FileItem>
        </List.Item>
      )}
    />
  );
};

export default FileList;
