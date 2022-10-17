import React, {useEffect, useMemo, useState} from 'react';
import {useMeasure} from 'react-use';

import {Checkbox} from 'antd';
import {CheckboxChangeEvent} from 'antd/lib/checkbox';

import {DEFAULT_PANE_TITLE_HEIGHT} from '@constants/constants';

import {GitChangedFile} from '@models/git';

import {setGitLoading} from '@redux/git';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {TitleBar} from '@molecules';

import {promiseFromIpcRenderer} from '@utils/promises';

import BottomActions from './BottomActions';
import FileList from './FileList';
import * as S from './GitPane.styled';
import RemoteInput from './RemoteInput';

const GitPane: React.FC<{height: number}> = ({height}) => {
  const dispatch = useAppDispatch();
  const changedFiles = useAppSelector(state => state.git.changedFiles);
  const gitLoading = useAppSelector(state => state.git.loading);
  const gitRepo = useAppSelector(state => state.git.repo);
  const hasRemoteRepo = useAppSelector(state => state.git.repo?.hasRemoteRepo);
  const selectedProjectRootFolder = useAppSelector(state => state.config.selectedProjectRootFolder);

  const [selectedStagedFiles, setSelectedStagedFiles] = useState<GitChangedFile[]>([]);
  const [selectedUnstagedFiles, setSelectedUnstagedFiles] = useState<GitChangedFile[]>([]);
  const [stagedFiles, setStagedFiles] = useState<GitChangedFile[]>([]);
  const [unstagedFiles, setUnstagedFiles] = useState<GitChangedFile[]>([]);

  const [remoteInputRef, {height: remoteInputHeight}] = useMeasure<HTMLDivElement>();
  const [bottomActionsRef, {height: bottomActionsHeight}] = useMeasure<HTMLDivElement>();

  const fileContainerHeight = useMemo(() => {
    let h: number = height - DEFAULT_PANE_TITLE_HEIGHT;

    // 12 is the margin top of the git pane content
    if (gitRepo) {
      h -= bottomActionsHeight + 12;
    }

    if (!hasRemoteRepo) {
      h -= remoteInputHeight;
    }

    return h;
  }, [bottomActionsHeight, gitRepo, hasRemoteRepo, height, remoteInputHeight]);

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
    dispatch(setGitLoading(true));

    if (type === 'stage') {
      await promiseFromIpcRenderer('git.stageChangedFiles', 'git.stageChangedFiles.result', {
        localPath: selectedProjectRootFolder,
        filePaths: selectedUnstagedFiles.map(item => item.fullGitPath),
      });

      setSelectedUnstagedFiles([]);
    } else {
      await promiseFromIpcRenderer('git.unstageFiles', 'git.unstageFiles.result', {
        localPath: selectedProjectRootFolder,
        filePaths: selectedStagedFiles.map(item => item.fullGitPath),
      });

      setSelectedStagedFiles([]);
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
      <TitleBar title="Git" closable />

      {gitLoading ? (
        <S.Skeleton active />
      ) : changedFiles.length ? (
        <>
          {!hasRemoteRepo ? (
            <S.RemoteInputContainer ref={remoteInputRef}>
              <RemoteInput />
            </S.RemoteInputContainer>
          ) : null}

          <S.FileContainer $height={fileContainerHeight}>
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
                    loading={gitLoading}
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
                loading={gitLoading}
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

      {gitRepo ? (
        <S.BottomActionsRef ref={bottomActionsRef}>
          <BottomActions />
        </S.BottomActionsRef>
      ) : null}
    </S.GitPaneContainer>
  );
};

export default GitPane;
