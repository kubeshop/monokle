import React, {useEffect, useState} from 'react';

import {Checkbox} from 'antd';
import {CheckboxChangeEvent} from 'antd/lib/checkbox';

import {setGitLoading} from '@redux/git';
import {stageChangedFiles, unstageFiles} from '@redux/git/git.ipc';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {TitleBarWrapper} from '@components/atoms/StyledComponents/TitleBarWrapper';

import {usePaneHeight} from '@hooks/usePaneHeight';

import {showGitErrorModal} from '@utils/terminal';

import {TitleBar} from '@monokle/components';
import {GitChangedFile} from '@shared/models/git';

import BottomActions from './BottomActions';
import FileList from './FileList';
import * as S from './GitPane.styled';
import RemoteInput from './RemoteInput';

const GitPane: React.FC = () => {
  const dispatch = useAppDispatch();
  const changedFiles = useAppSelector(state => state.git.changedFiles);
  const gitLoading = useAppSelector(state => state.git.loading);
  const gitRepo = useAppSelector(state => state.git.repo);
  const remoteRepo = useAppSelector(state => state.git.repo?.remoteRepo);
  const selectedProjectRootFolder = useAppSelector(state => state.config.selectedProjectRootFolder) || '';

  const [selectedStagedFiles, setSelectedStagedFiles] = useState<GitChangedFile[]>([]);
  const [selectedUnstagedFiles, setSelectedUnstagedFiles] = useState<GitChangedFile[]>([]);
  const [stagedFiles, setStagedFiles] = useState<GitChangedFile[]>([]);
  const [unstagedFiles, setUnstagedFiles] = useState<GitChangedFile[]>([]);

  const height = usePaneHeight();

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
      try {
        await stageChangedFiles({
          localPath: selectedProjectRootFolder,
          filePaths: selectedUnstagedFiles.map(item => item.fullGitPath),
        });
        setSelectedUnstagedFiles([]);
      } catch (e: any) {
        showGitErrorModal('Staging changes failed!', e.message);
        setGitLoading(false);
      }
    } else {
      try {
        await unstageFiles({
          localPath: selectedProjectRootFolder,
          filePaths: selectedStagedFiles.map(item => item.fullGitPath),
        });

        setSelectedStagedFiles([]);
      } catch (e: any) {
        showGitErrorModal('Unstaging changes failed!', e.message);
        setGitLoading(false);
      }
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
      <TitleBarWrapper>
        <TitleBar title="Git" />
      </TitleBarWrapper>

      {gitLoading ? (
        <S.Skeleton active />
      ) : remoteRepo?.authRequired ? (
        <S.AuthRequiredContainer>
          <S.CloseOutlined />
          <div>
            <b>{remoteRepo.errorMessage}</b>. Please sign in using the terminal.
          </div>
        </S.AuthRequiredContainer>
      ) : changedFiles.length ? (
        <>
          {!remoteRepo?.exists ? <RemoteInput /> : null}

          <S.FileContainer>
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
        <S.NoChangedFilesLabel>
          {!gitRepo
            ? 'Initialize a new Git repository by clicking on the button from the header.'
            : 'There were no changed files found.'}{' '}
        </S.NoChangedFilesLabel>
      )}

      {gitRepo ? <BottomActions /> : null}
    </S.GitPaneContainer>
  );
};

export default GitPane;
