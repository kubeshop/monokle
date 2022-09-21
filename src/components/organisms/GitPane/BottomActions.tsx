import {useState} from 'react';

import {Button} from 'antd';

import {useAppSelector} from '@redux/hooks';

import * as S from './BottomActions.styled';
import CommitModal from './CommitModal';

const BottomActions: React.FC = () => {
  const currentBranch = useAppSelector(state => state.git.repo?.currentBranch);

  const [showCommitModal, setShowCommitModal] = useState(false);

  return (
    <S.BottomActionsContainer>
      <Button type="primary">Push</Button>
      <Button type="primary" onClick={() => setShowCommitModal(true)}>
        Commit to {currentBranch || 'main'}
      </Button>

      <CommitModal visible={showCommitModal} setShowModal={value => setShowCommitModal(value)} />
    </S.BottomActionsContainer>
  );
};

export default BottomActions;
