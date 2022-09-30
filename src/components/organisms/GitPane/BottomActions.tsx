import {useCallback, useMemo, useState} from 'react';
import {useMeasure} from 'react-use';

import {Menu, Tooltip} from 'antd';

import {ArrowDownOutlined, ArrowUpOutlined, DownOutlined} from '@ant-design/icons';

import {TOOLTIP_DELAY} from '@constants/constants';
import {
  GitCommitDisabledTooltip,
  GitCommitEnabledTooltip,
  GitPushDisabledTooltip,
  GitPushEnabledTooltip,
} from '@constants/tooltips';

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
  const [pushPublishLoading, setPushPublishLoading] = useState(false);
  const [showCommitModal, setShowCommitModal] = useState(false);

  const [bottomActionsRef, {width: bottomActionsWidth}] = useMeasure<HTMLDivElement>();

  const isCommitDisabled = useMemo(
    () => Boolean(!changedFiles.filter(file => file.status === 'staged').length),
    [changedFiles]
  );
  const isPushDisabled = useMemo(() => {
    if (!gitRepo) {
      return true;
    }

    return Boolean(!gitRepo.commits.ahead && !gitRepo.commits.behind);
  }, [gitRepo]);

  const publishHandler = useCallback(async () => {
    setPushPublishLoading(true);

    await promiseFromIpcRenderer('git.publishLocalBranch', 'git.publishLocalBranch.result', {
      localPath: selectedProjectRootFolder,
      branchName: currentBranch || 'main',
    });

    setPushPublishLoading(false);
  }, [currentBranch, selectedProjectRootFolder]);

  const isBranchOnRemote = useMemo(() => {
    if (!gitRepo) {
      return false;
    }

    return gitRepo.branches.includes(`origin/${gitRepo.currentBranch}`);
  }, [gitRepo]);

  const menuItems = useMemo(
    () => [
      {
        disabled: isPushDisabled,
        key: 'publish_and_push',
        label: 'Publish & Push',
        onClick: async () => {
          setPushPublishLoading(true);

          await publishHandler();
          await promiseFromIpcRenderer('git.pushChanges', 'git.pushChanges.result', {
            localPath: selectedProjectRootFolder,
            branchName: currentBranch || 'main',
          });

          dispatch(setAlert({title: 'Pushed changes successfully', message: '', type: AlertEnum.Success}));

          setPushPublishLoading(false);
        },
      },
    ],
    [currentBranch, dispatch, isPushDisabled, publishHandler, selectedProjectRootFolder]
  );

  const pushHandler = async () => {
    setPushPublishLoading(true);

    await promiseFromIpcRenderer('git.pushChanges', 'git.pushChanges.result', {
      localPath: selectedProjectRootFolder,
      branchName: currentBranch || 'main',
    });

    setPushPublishLoading(false);
  };

  if (!gitRepo) {
    return null;
  }

  return (
    <S.BottomActionsContainer ref={bottomActionsRef}>
      <Tooltip
        mouseEnterDelay={TOOLTIP_DELAY}
        title={
          isCommitDisabled ? GitCommitDisabledTooltip : <GitCommitEnabledTooltip branchName={currentBranch || 'main'} />
        }
      >
        <S.CommitButton
          $width={bottomActionsWidth / 2 - 48}
          disabled={isCommitDisabled}
          loading={commitLoading}
          type="primary"
          onClick={() => setShowCommitModal(true)}
        >
          Commit
        </S.CommitButton>
      </Tooltip>

      {!isBranchOnRemote ? (
        <S.PublishBranchButton
          loading={pushPublishLoading}
          icon={<DownOutlined />}
          placement="topLeft"
          trigger={['click']}
          type="primary"
          overlay={<Menu items={menuItems} />}
          onClick={publishHandler}
          disabled={!gitRepo.hasRemoteRepo}
        >
          Publish branch
        </S.PublishBranchButton>
      ) : (
        <Tooltip
          mouseEnterDelay={TOOLTIP_DELAY}
          title={
            isPushDisabled ? GitPushDisabledTooltip : <GitPushEnabledTooltip commitsNumber={gitRepo.commits.ahead} />
          }
        >
          <S.PushButton
            disabled={!gitRepo.hasRemoteRepo || isPushDisabled}
            loading={pushPublishLoading}
            type="primary"
            onClick={pushHandler}
          >
            Sync
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
          </S.PushButton>
        </Tooltip>
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
