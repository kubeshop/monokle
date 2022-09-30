import {useCallback, useMemo, useState} from 'react';

import {Menu, Tooltip} from 'antd';

import {ArrowDownOutlined, ArrowUpOutlined, DownOutlined} from '@ant-design/icons';

import {TOOLTIP_DELAY} from '@constants/constants';
import {GitCommitDisabledTooltip, GitCommitEnabledTooltip} from '@constants/tooltips';

import {AlertEnum} from '@models/alert';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';

import {promiseFromIpcRenderer} from '@utils/promises';

import * as S from './BottomActions.styled';
import CommitModal from './CommitModal';

const BottomActions: React.FC = () => {
  const dispatch = useAppDispatch();
  const changedFiles = useAppSelector(state => state.git.changedFiles);
  const currentBranch = useAppSelector(state => state.git.repo?.currentBranch);
  const gitRepo = useAppSelector(state => state.git.repo);
  const selectedProjectRootFolder = useAppSelector(state => state.config.selectedProjectRootFolder);

  const [commitLoading, setCommitLoading] = useState(false);
  const [syncPublishLoading, setSyncPublishLoading] = useState(false);
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

    return Boolean(!gitRepo.commits.ahead && !gitRepo.commits.behind);
  }, [gitRepo]);

  const publishHandler = useCallback(async () => {
    setSyncPublishLoading(true);

    await promiseFromIpcRenderer('git.publishLocalBranch', 'git.publishLocalBranch.result', {
      localPath: selectedProjectRootFolder,
      branchName: currentBranch || 'main',
    });

    setSyncPublishLoading(false);
  }, [currentBranch, selectedProjectRootFolder]);

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
          setSyncPublishLoading(true);

          await publishHandler();
          await promiseFromIpcRenderer('git.pushChanges', 'git.pushChanges.result', {
            localPath: selectedProjectRootFolder,
            branchName: currentBranch || 'main',
          });

          dispatch(setAlert({title: 'Pushed changes successfully', message: '', type: AlertEnum.Success}));

          setSyncPublishLoading(false);
        },
      },
    ],
    [currentBranch, dispatch, isPushDisabled, publishHandler, selectedProjectRootFolder]
  );

  const syncMenuItems = useMemo(
    () => [
      {
        key: 'fetch',
        label: 'Fetch',
        onClick: async () => {
          setSyncPublishLoading(true);
          await promiseFromIpcRenderer('git.fetchRepo', 'git.fetchRepo.result', selectedProjectRootFolder);
          dispatch(setAlert({title: 'Repo fetched successfully', message: '', type: AlertEnum.Success}));
          setSyncPublishLoading(false);
        },
      },
      {
        key: 'pull',
        label: 'Pull',
        onClick: async () => {
          setSyncPublishLoading(true);
          await promiseFromIpcRenderer('git.pullChanges', 'git.pullChanges.result', selectedProjectRootFolder);
          dispatch(setAlert({title: 'Pulled changes successfully', message: '', type: AlertEnum.Success}));
          setSyncPublishLoading(false);
        },
      },
      {
        disabled: isPushDisabled,
        key: 'push',
        label: 'Push',
        onClick: async () => {
          setSyncPublishLoading(true);
          await promiseFromIpcRenderer('git.pushChanges', 'git.pushChanges.result', {
            localPath: selectedProjectRootFolder,
            branchName: currentBranch || 'main',
          });
          dispatch(setAlert({title: 'Pushed changes successfully', message: '', type: AlertEnum.Success}));
          setSyncPublishLoading(false);
        },
      },
    ],
    [currentBranch, dispatch, isPushDisabled, selectedProjectRootFolder]
  );

  const syncHandler = async () => {
    if (!gitRepo) {
      return;
    }

    setSyncPublishLoading(true);

    let alertActionMessage = '';

    if (gitRepo.commits.behind) {
      await promiseFromIpcRenderer('git.pullChanges', 'git.pullChanges.result', selectedProjectRootFolder);

      alertActionMessage = 'Pulled';
    }

    if (gitRepo.commits.ahead) {
      await promiseFromIpcRenderer('git.pushChanges', 'git.pushChanges.result', {
        localPath: selectedProjectRootFolder,
        branchName: currentBranch || 'main',
      });

      if (alertActionMessage === 'Pulled') {
        alertActionMessage = 'Synced';
      } else {
        alertActionMessage = 'Pushed';
      }
    }

    dispatch(setAlert({title: `${alertActionMessage} changes successfully`, message: '', type: AlertEnum.Success}));

    setSyncPublishLoading(false);
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
          loading={syncPublishLoading || commitLoading}
          type="primary"
          onClick={() => setShowCommitModal(true)}
        >
          Commit
        </S.CommitButton>
      </Tooltip>

      {!isBranchOnRemote ? (
        <S.PublishBranchButton
          disabled={!gitRepo.hasRemoteRepo}
          loading={syncPublishLoading || commitLoading}
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
          loading={syncPublishLoading || commitLoading}
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
        setCommitLoading={value => setCommitLoading(value)}
        setShowModal={value => setShowCommitModal(value)}
      />
    </S.BottomActionsContainer>
  );
};

export default BottomActions;
