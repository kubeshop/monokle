import {useCallback, useMemo, useState} from 'react';

import {Menu, Modal, Tooltip} from 'antd';

import {ArrowDownOutlined, ArrowUpOutlined, DownOutlined} from '@ant-design/icons';

import {GIT_ERROR_MODAL_DESCRIPTION, TOOLTIP_DELAY} from '@constants/constants';
import {GitCommitDisabledTooltip, GitCommitEnabledTooltip} from '@constants/tooltips';

import {setGitLoading} from '@redux/git';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';

import {promiseFromIpcRenderer} from '@utils/promises';
import {addDefaultCommandTerminal} from '@utils/terminal';

import {AlertEnum} from '@shared/models/alert';

import * as S from './BottomActions.styled';
import CommitModal from './CommitModal';

const BottomActions: React.FC = () => {
  const dispatch = useAppDispatch();
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);
  const changedFiles = useAppSelector(state => state.git.changedFiles);
  const currentBranch = useAppSelector(state => state.git.repo?.currentBranch);
  const defaultShell = useAppSelector(state => state.terminal.settings.defaultShell);
  const gitLoading = useAppSelector(state => state.git.loading);
  const gitRepo = useAppSelector(state => state.git.repo);
  const selectedProjectRootFolder = useAppSelector(state => state.config.selectedProjectRootFolder);
  const terminalsMap = useAppSelector(state => state.terminal.terminalsMap);

  const [showCommitModal, setShowCommitModal] = useState(false);

  const isCommitDisabled = useMemo(
    () => Boolean(!changedFiles.filter(file => file.status === 'staged').length),
    [changedFiles]
  );

  const isPushDisabled = useMemo(() => {
    if (!gitRepo) {
      return true;
    }

    return Boolean(!gitRepo.commits.ahead);
  }, [gitRepo]);

  const isSyncDisabled = useMemo(() => {
    if (!gitRepo) {
      return true;
    }

    return false;
  }, [gitRepo]);

  const pullPushChangesHandler = useCallback(
    async (type: 'pull' | 'push') => {
      if (!gitRepo) {
        return;
      }

      const result = await promiseFromIpcRenderer('git.pushChanges', 'git.pushChanges.result', {
        localPath: selectedProjectRootFolder,
        branchName: currentBranch || 'main',
      });

      if (result.error) {
        Modal.warning({
          title: `${type === 'pull' ? 'Pull' : 'Push'} failed`,
          content: <div>{GIT_ERROR_MODAL_DESCRIPTION}</div>,
          zIndex: 100000,
          onCancel: () => {
            addDefaultCommandTerminal(
              terminalsMap,
              `git ${type} origin ${gitRepo.currentBranch}`,
              defaultShell,
              bottomSelection,
              dispatch
            );
          },
          onOk: () => {
            addDefaultCommandTerminal(
              terminalsMap,
              `git ${type} origin ${gitRepo.currentBranch}`,
              defaultShell,
              bottomSelection,
              dispatch
            );
          },
        });
      } else {
        dispatch(
          setAlert({
            title: `${type === 'pull' ? 'Pulled' : 'Pushed'} changes successfully`,
            message: '',
            type: AlertEnum.Success,
          })
        );
      }

      return result.error;
    },
    [bottomSelection, currentBranch, defaultShell, dispatch, gitRepo, selectedProjectRootFolder, terminalsMap]
  );

  const publishHandler = useCallback(async () => {
    dispatch(setGitLoading(true));

    await promiseFromIpcRenderer('git.publishLocalBranch', 'git.publishLocalBranch.result', {
      localPath: selectedProjectRootFolder,
      branchName: currentBranch || 'main',
    });

    dispatch(setGitLoading(false));
  }, [currentBranch, dispatch, selectedProjectRootFolder]);

  const isBranchOnRemote = useMemo(() => {
    if (!gitRepo) {
      return false;
    }

    return gitRepo.branches.includes(`origin/${gitRepo.currentBranch}`);
  }, [gitRepo]);

  const publishMenuItems = useMemo(
    () => [
      {
        disabled: isPushDisabled,
        key: 'publish_and_push',
        label: 'Publish & Push',
        onClick: async () => {
          dispatch(setGitLoading(true));
          await publishHandler();
          await pullPushChangesHandler('push');
        },
      },
    ],
    [dispatch, isPushDisabled, publishHandler, pullPushChangesHandler]
  );

  const syncMenuItems = useMemo(
    () => [
      {
        key: 'fetch',
        label: 'Fetch',
        onClick: async () => {
          dispatch(setGitLoading(true));
          await promiseFromIpcRenderer('git.fetchRepo', 'git.fetchRepo.result', selectedProjectRootFolder);
          dispatch(setAlert({title: 'Repository fetched successfully', message: '', type: AlertEnum.Success}));
        },
      },
      {
        key: 'pull',
        label: 'Pull',
        onClick: async () => {
          dispatch(setGitLoading(true));
          await pullPushChangesHandler('pull');
          dispatch(setGitLoading(false));
        },
      },
      {
        disabled: isPushDisabled,
        key: 'push',
        label: 'Push',
        onClick: async () => {
          dispatch(setGitLoading(true));
          await pullPushChangesHandler('push');
        },
      },
    ],
    [dispatch, isPushDisabled, pullPushChangesHandler, selectedProjectRootFolder]
  );

  const syncHandler = async () => {
    if (!gitRepo) {
      return;
    }

    dispatch(setGitLoading(true));

    if (gitRepo.commits.behind) {
      const error = await pullPushChangesHandler('pull');

      if (error) {
        dispatch(setGitLoading(false));
        return;
      }
    }

    if (gitRepo.commits.ahead) {
      const error = await pullPushChangesHandler('push');

      if (error) {
        dispatch(setGitLoading(false));
      }
    }
  };

  if (!gitRepo) {
    return null;
  }

  return (
    <S.BottomActionsContainer>
      <Tooltip
        mouseEnterDelay={TOOLTIP_DELAY}
        title={
          isCommitDisabled ? GitCommitDisabledTooltip : <GitCommitEnabledTooltip branchName={currentBranch || 'main'} />
        }
      >
        <S.CommitButton
          disabled={isCommitDisabled}
          loading={gitLoading}
          type="primary"
          onClick={() => setShowCommitModal(true)}
        >
          Commit
        </S.CommitButton>
      </Tooltip>

      {!isBranchOnRemote ? (
        <S.PublishBranchButton
          disabled={!gitRepo.hasRemoteRepo}
          loading={gitLoading}
          icon={<DownOutlined />}
          placement="topLeft"
          trigger={['click']}
          type="primary"
          overlay={<Menu items={publishMenuItems} />}
          onClick={publishHandler}
        >
          Publish branch
        </S.PublishBranchButton>
      ) : (
        <S.SyncButton
          disabled={!gitRepo.hasRemoteRepo || isSyncDisabled}
          loading={gitLoading}
          icon={<DownOutlined />}
          overlay={<Menu items={syncMenuItems} />}
          placement="topLeft"
          trigger={['click']}
          type="primary"
          onClick={syncHandler}
        >
          <S.SyncButtonLabel>Sync</S.SyncButtonLabel>
          {gitRepo.commits.behind > 0 ? (
            <S.PushPullContainer>
              {gitRepo.commits.behind} <ArrowDownOutlined />
            </S.PushPullContainer>
          ) : null}
          {gitRepo.commits.ahead > 0 ? (
            <S.PushPullContainer>
              {gitRepo.commits.ahead} <ArrowUpOutlined />
            </S.PushPullContainer>
          ) : null}
        </S.SyncButton>
      )}

      <CommitModal
        visible={showCommitModal}
        setCommitLoading={value => dispatch(setGitLoading(value))}
        setShowModal={value => setShowCommitModal(value)}
      />
    </S.BottomActionsContainer>
  );
};

export default BottomActions;
