import {Select} from 'antd';

import invariant from 'tiny-invariant';

import {CompareSide, selectGitResourceSet} from '@redux/compare';
import {useAppSelector} from '@redux/hooks';

import * as S from '../ResourceSetSelectColor.styled';

type IProps = {
  side: CompareSide;
};

const GitCommitSelect: React.FC<IProps> = ({side}) => {
  const resourceSet = useAppSelector(state => selectGitResourceSet(state, side));
  invariant(resourceSet, 'invalid_state');

  const {currentGitBranch, currentGitBranchCommits} = resourceSet;

  if (!currentGitBranch) {
    return <Select disabled placeholder="Select commit..." style={{width: '100%'}} />;
  }

  return (
    <S.SelectColor style={{width: '100%'}}>
      <Select placeholder="Select commit..." style={{width: '100%'}}>
        {currentGitBranchCommits.map(commit => (
          <Select.Option key={commit.hash} value={commit.hash}>
            {commit.message} <S.CommitHash>{commit.hash.slice(0, 7)}</S.CommitHash>
          </Select.Option>
        ))}
      </Select>
    </S.SelectColor>
  );
};

export default GitCommitSelect;
