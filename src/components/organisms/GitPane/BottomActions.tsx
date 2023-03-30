import {useCallback, useMemo, useState} from 'react';

import {Tooltip} from 'antd';

import {ArrowDownOutlined, ArrowUpOutlined, DownOutlined} from '@ant-design/icons';

import {TOOLTIP_DELAY} from '@constants/constants';
import {GitCommitDisabledTooltip, GitCommitEnabledTooltip} from '@constants/tooltips';

import {addGitBranch, setGitLoading} from '@redux/git';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';

import {promiseFromIpcRenderer} from '@utils/promises';
import {showGitErrorModal} from '@utils/terminal';

import {AlertEnum} from '@shared/models/alert';

import * as S from './BottomActions.styled';
import CommitModal from './CommitModal';

const BottomActions: React.FC = () => {
  const dispatch = useAppDispatch();
  const changedFiles = useAppSelector(state => state.git.changedFiles);
  const currentBranch = useAppSelector(state => state.git.repo?.currentBranch);
  const gitLoading = useAppSelector(state => state.git.loading);
  const gitRepo = useAppSelector(state => state.git.repo);
  const selectedProjectRootFolder = useAppSelector(state => state.config.selectedProjectRootFolder);

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

      let result: any;

      if (type === 'pull') {
        result = await promiseFromIpcRenderer('git.pullChanges', 'git.pushChanges.result', selectedProjectRootFolder);
      } else if (type === 'push') {
        result = await promiseFromIpcRenderer('git.pushChanges', 'git.pushChanges.result', {
          localPath: selectedProjectRootFolder,
          branchName: currentBranch || 'main',
        });
      }

      if (result.error) {
        showGitErrorModal(
          `${type === 'pull' ? 'Pull' : 'Push'} failed`,
          `git ${type} origin ${gitRepo.currentBranch}`,
          dispatch
        );
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
    [currentBranch, dispatch, gitRepo, selectedProjectRootFolder]
  );

  const publishHandler = useCallback(async () => {
    if (!gitRepo) {
      return;
    }

    dispatch(setGitLoading(true));

    const result = await promiseFromIpcRenderer('git.publishLocalBranch', 'git.publishLocalBranch.result', {
      localPath: selectedProjectRootFolder,
      branchName: currentBranch || 'main',
    });

    if (result.error) {
      showGitErrorModal('Publishing local branch failed', `git push -u origin ${currentBranch || 'main'}`, dispatch);
      setGitLoading(false);
      return;
    }

    dispatch(addGitBranch(`origin/${currentBranch}`));
    dispatch(setAlert({title: 'Branch published successfully', message: '', type: AlertEnum.Success}));

    dispatch(setGitLoading(false));
  }, [currentBranch, dispatch, gitRepo, selectedProjectRootFolder]);

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
          disabled={!gitRepo.remoteRepo.exists}
          loading={gitLoading}
          icon={<DownOutlined />}
          placement="topLeft"
          trigger={['click']}
          type="primary"
          menu={{items: publishMenuItems}}
          onClick={publishHandler}
        >
          Publish branch
        </S.PublishBranchButton>
      ) : (
        <S.SyncButton
          disabled={!gitRepo.remoteRepo.exists || isSyncDisabled}
          loading={gitLoading}
          icon={<DownOutlined />}
          menu={{items: syncMenuItems}}
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
