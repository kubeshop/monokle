import React, {useEffect, useState} from 'react';

import {Button, Checkbox, Dropdown, Space} from 'antd';
import {CheckboxChangeEvent} from 'antd/lib/checkbox';

import {DownOutlined} from '@ant-design/icons';

import {GitChangedFile} from '@models/git';

import {useAppSelector} from '@redux/hooks';

import {TitleBar} from '@molecules';

import {Icon} from '@components/atoms';

import DropdownMenu from './DropdownMenu';
import FileList from './FileList';
import * as S from './GitPane.styled';

const GitPane: React.FC<{height: number}> = ({height}) => {
  const changedFiles = useAppSelector(state => state.git.changedFiles);

  const [stagedFiles, setStagedFiles] = useState<GitChangedFile[]>([]);
  const [unstagedFiles, setUnstagedFiles] = useState<GitChangedFile[]>([]);

  const [selectedStagedFiles, setSelectedStagedFiles] = useState<GitChangedFile[]>([]);
  const [selectedUnstagedFiles, setSelectedUnstagedFiles] = useState<GitChangedFile[]>([]);

  const handleSelect = (event: CheckboxChangeEvent, item: GitChangedFile) => {
    if (event.target.checked) {
      if (item.status === 'staged') {
        setSelectedStagedFiles([...selectedStagedFiles, item]);
      } else {
        setSelectedUnstagedFiles([...selectedUnstagedFiles, item]);
      }
    } else if (item.status === 'staged') {
      setSelectedStagedFiles(selectedStagedFiles.filter(file => file.name !== item.name));
    } else {
      setSelectedUnstagedFiles(selectedUnstagedFiles.filter(file => file.name !== item.name));
    }
  };

  const handleSelectAll = () => {
    if (selectedStagedFiles.length + selectedUnstagedFiles.length === changedFiles.length) {
      setSelectedStagedFiles([]);
      setSelectedUnstagedFiles([]);
    } else {
      setSelectedStagedFiles(stagedFiles);
      setSelectedUnstagedFiles(unstagedFiles);
    }
  };

  const handleSelectStagedFiles = () => {
    if (selectedStagedFiles.length === stagedFiles.length) {
      setSelectedStagedFiles([]);
    } else {
      setSelectedStagedFiles(stagedFiles);
    }
  };

  const handleSelectUnstagedFiles = () => {
    if (selectedUnstagedFiles.length === unstagedFiles.length) {
      setSelectedUnstagedFiles([]);
    } else {
      setSelectedUnstagedFiles(unstagedFiles);
    }
  };

  useEffect(() => {
    if (!changedFiles?.length) {
      return;
    }

    setStagedFiles(changedFiles.filter(file => file.status === 'staged'));
    setUnstagedFiles(changedFiles.filter(file => file.status === 'unstaged'));
  }, [changedFiles]);

  return (
    <S.GitPaneContainer id="GitPane" $height={height}>
      <TitleBar title="Commit" closable />

      <S.FileContainer>
        <S.CheckboxWrapper>
          <Checkbox
            onChange={handleSelectAll}
            checked={selectedStagedFiles.length + selectedUnstagedFiles.length === changedFiles.length}
          >
            <S.ChangeList>
              Changelist <S.ChangeListStatus>{changedFiles.length} files</S.ChangeListStatus>
            </S.ChangeList>
          </Checkbox>
        </S.CheckboxWrapper>

        <S.CheckboxWrapper>
          <Checkbox onChange={handleSelectStagedFiles} checked={selectedStagedFiles.length === stagedFiles.length}>
            <S.StagedUnstagedLabel>STAGED</S.StagedUnstagedLabel>
          </Checkbox>
        </S.CheckboxWrapper>

        <FileList
          files={stagedFiles}
          selectedFiles={selectedStagedFiles}
          handleSelect={(e, item) => handleSelect(e, item)}
        />

        <br />

        <S.CheckboxWrapper>
          <Checkbox
            onChange={handleSelectUnstagedFiles}
            checked={selectedUnstagedFiles.length === unstagedFiles.length}
          >
            <S.StagedUnstagedLabel>UNSTAGED</S.StagedUnstagedLabel>
          </Checkbox>
        </S.CheckboxWrapper>

        <FileList
          files={unstagedFiles}
          selectedFiles={selectedUnstagedFiles}
          handleSelect={(e, item) => handleSelect(e, item)}
        />

        {selectedStagedFiles.length > 0 && (
          <S.FilesAction>
            <Dropdown overlay={<DropdownMenu items={selectedStagedFiles} />} trigger={['click']}>
              <Space>
                <Button type="primary" onClick={e => e.preventDefault()} size="large">
                  <Icon name="git-ops" />
                  Commit to a new branch & PR
                  <DownOutlined />
                </Button>
              </Space>
            </Dropdown>
          </S.FilesAction>
        )}
      </S.FileContainer>
    </S.GitPaneContainer>
  );
};

export default GitPane;
