import React, {useEffect, useState} from 'react';

import {Checkbox} from 'antd';
import {CheckboxChangeEvent} from 'antd/lib/checkbox';

import {DEFAULT_PANE_TITLE_HEIGHT} from '@constants/constants';

import {GitChangedFile} from '@models/git';

import {useAppSelector} from '@redux/hooks';

import {TitleBar} from '@molecules';

import {promiseFromIpcRenderer} from '@utils/promises';

import BottomActions from './BottomActions';
import FileList from './FileList';
import * as S from './GitPane.styled';
import RemoteInput from './RemoteInput';

const GitPane: React.FC<{height: number}> = ({height}) => {
  const changedFiles = useAppSelector(state => state.git.changedFiles);
  const gitRepo = useAppSelector(state => state.git.repo);
  const hasRemoteRepo = useAppSelector(state => state.git.repo?.hasRemoteRepo);
  const selectedProjectRootFolder = useAppSelector(state => state.config.selectedProjectRootFolder);

  const [loading, setLoading] = useState(false);
  const [selectedStagedFiles, setSelectedStagedFiles] = useState<GitChangedFile[]>([]);
  const [selectedUnstagedFiles, setSelectedUnstagedFiles] = useState<GitChangedFile[]>([]);
  const [stagedFiles, setStagedFiles] = useState<GitChangedFile[]>([]);
  const [unstagedFiles, setUnstagedFiles] = useState<GitChangedFile[]>([]);

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

  const handleStageUnstageSelectedFiles = async (type: 'stage' | 'unstage') => {
    setLoading(true);

    if (type === 'stage') {
      await promiseFromIpcRenderer('git.stageChangedFiles', 'git.stageChangedFiles.result', {
        localPath: selectedProjectRootFolder,
        filePaths: selectedUnstagedFiles.map(item => item.gitPath),
      });

      setSelectedUnstagedFiles([]);
    } else {
      await promiseFromIpcRenderer('git.unstageFiles', 'git.unstageFiles.result', {
        localPath: selectedProjectRootFolder,
        filePaths: selectedStagedFiles.map(item => item.gitPath),
      });

      setSelectedStagedFiles([]);
    }

    setLoading(false);
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
      {changedFiles.length ? (
        <>
          <TitleBar title="Git" closable />

          {!hasRemoteRepo ? <RemoteInput /> : null}

          <S.FileContainer $height={height - DEFAULT_PANE_TITLE_HEIGHT}>
            <S.ChangeList>
              Changelist <S.ChangeListStatus>{changedFiles.length} files</S.ChangeListStatus>
            </S.ChangeList>

            {stagedFiles.length ? (
              <S.StagedFilesContainer>
                <S.CheckboxWrapper>
                  <Checkbox
                    onChange={handleSelectStagedFiles}
                    checked={selectedStagedFiles.length === stagedFiles.length}
                  >
                    <S.StagedUnstagedLabel>STAGED</S.StagedUnstagedLabel>
                  </Checkbox>
                </S.CheckboxWrapper>
                <FileList
                  files={stagedFiles}
                  selectedFiles={selectedStagedFiles}
                  handleSelect={(e, item) => handleSelect(e, item)}
                />

                {selectedStagedFiles.length ? (
                  <S.StageUnstageSelectedButton
                    loading={loading}
                    type="primary"
                    onClick={() => {
                      handleStageUnstageSelectedFiles('unstage');
                    }}
                  >
                    Unstage selected
                  </S.StageUnstageSelectedButton>
                ) : null}
              </S.StagedFilesContainer>
            ) : null}

            <S.CheckboxWrapper>
              <Checkbox
                checked={Boolean(unstagedFiles.length && selectedUnstagedFiles.length === unstagedFiles.length)}
                disabled={Boolean(!unstagedFiles.length)}
                onChange={handleSelectUnstagedFiles}
              >
                <S.StagedUnstagedLabel>UNSTAGED</S.StagedUnstagedLabel>
              </Checkbox>
            </S.CheckboxWrapper>
            <FileList
              files={unstagedFiles}
              selectedFiles={selectedUnstagedFiles}
              handleSelect={(e, item) => handleSelect(e, item)}
            />
            {selectedUnstagedFiles.length ? (
              <S.StageUnstageSelectedButton
                loading={loading}
                type="primary"
                onClick={() => {
                  handleStageUnstageSelectedFiles('stage');
                }}
              >
                Stage selected
              </S.StageUnstageSelectedButton>
            ) : null}
          </S.FileContainer>
        </>
      ) : (
        <S.NoChangedFilesLabel>There were no changed files found.</S.NoChangedFilesLabel>
      )}

      {gitRepo ? <BottomActions /> : null}
    </S.GitPaneContainer>
  );
};

export default GitPane;
