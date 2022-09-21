import {useCallback, useMemo, useState} from 'react';

import {Button, Menu} from 'antd';

import {DownOutlined} from '@ant-design/icons';

import {useAppSelector} from '@redux/hooks';

import {promiseFromIpcRenderer} from '@utils/promises';

import * as S from './BottomActions.styled';
import CommitModal from './CommitModal';

const BottomActions: React.FC = () => {
  const currentBranch = useAppSelector(state => state.git.repo?.currentBranch);
  const gitRepo = useAppSelector(state => state.git.repo);
  const selectedProjectRootFolder = useAppSelector(state => state.config.selectedProjectRootFolder);

  const [commitLoading, setCommitLoading] = useState(false);
  const [pushPublishLoading, setPushPublishLoading] = useState(false);
  const [showCommitModal, setShowCommitModal] = useState(false);

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
        key: 'publish_and_push',
        label: 'Publish & Push',
        onClick: async () => {
          setPushPublishLoading(true);

          await publishHandler();
          await promiseFromIpcRenderer('git.pushChanges', 'git.pushChanges.result', {
            localPath: selectedProjectRootFolder,
            branchName: currentBranch || 'main',
          });

          setPushPublishLoading(false);
        },
      },
    ],
    [currentBranch, publishHandler, selectedProjectRootFolder]
  );

  const pushHandler = async () => {
    setPushPublishLoading(true);

    await promiseFromIpcRenderer('git.pushChanges', 'git.pushChanges.result', {
      localPath: selectedProjectRootFolder,
      branchName: currentBranch || 'main',
    });

    setPushPublishLoading(false);
  };

  return (
    <S.BottomActionsContainer>
      {!isBranchOnRemote ? (
        <S.PublishBranchButton
          loading={pushPublishLoading}
          icon={<DownOutlined />}
          placement="topLeft"
          trigger={['click']}
          type="primary"
          overlay={<Menu items={menuItems} />}
          onClick={publishHandler}
          disabled={!gitRepo?.hasRemoteRepo}
        >
          Publish branch
        </S.PublishBranchButton>
      ) : (
        <Button disabled={!gitRepo?.hasRemoteRepo} loading={pushPublishLoading} type="primary" onClick={pushHandler}>
          Push
        </Button>
      )}

      <Button loading={commitLoading} type="primary" onClick={() => setShowCommitModal(true)}>
        Commit to {currentBranch || 'main'}
      </Button>

      <CommitModal
        visible={showCommitModal}
        setCommitLoading={value => setCommitLoading(value)}
        setShowModal={value => setShowCommitModal(value)}
      />
    </S.BottomActionsContainer>
  );
};

export default BottomActions;
