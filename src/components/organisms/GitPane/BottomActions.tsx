import {useMemo, useState} from 'react';

import {Button} from 'antd';

import {useAppSelector} from '@redux/hooks';

import {promiseFromIpcRenderer} from '@utils/promises';

import * as S from './BottomActions.styled';
import CommitModal from './CommitModal';

const BottomActions: React.FC = () => {
  const currentBranch = useAppSelector(state => state.git.repo?.currentBranch);
  const gitRepo = useAppSelector(state => state.git.repo);
  const selectedProjectRootFolder = useAppSelector(state => state.config.selectedProjectRootFolder);

  const [pushPublishLoading, setPushPublishLoading] = useState(false);
  const [showCommitModal, setShowCommitModal] = useState(false);

  const isBranchOnRemote = useMemo(() => {
    if (!gitRepo) {
      return false;
    }

    return gitRepo.branches.includes(`origin/${gitRepo.currentBranch}`);
  }, [gitRepo]);

  const pushPublishButtonLabel = useMemo(() => {
    if (!isBranchOnRemote) {
      return 'Publish branch';
    }

    return 'Push';
  }, [isBranchOnRemote]);

  const pushPublishHandler = async () => {
    setPushPublishLoading(true);

    if (!isBranchOnRemote) {
      await promiseFromIpcRenderer('git.publishLocalBranch', 'git.publishLocalBranch.result', {
        localPath: selectedProjectRootFolder,
        branchName: currentBranch || 'main',
      });
    }

    setPushPublishLoading(false);
  };

  return (
    <S.BottomActionsContainer>
      <Button loading={pushPublishLoading} type="primary" onClick={pushPublishHandler}>
        {pushPublishButtonLabel}
      </Button>
      <Button type="primary" onClick={() => setShowCommitModal(true)}>
        Commit to {currentBranch || 'main'}
      </Button>

      <CommitModal visible={showCommitModal} setShowModal={value => setShowCommitModal(value)} />
    </S.BottomActionsContainer>
  );
};

export default BottomActions;
