import {Select} from 'antd';

import invariant from 'tiny-invariant';

import {resourceSetSelected, selectGitResourceSet} from '@redux/compare';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {gitCommitDate} from '@utils/git';

import {CompareSide, PartialResourceSet} from '@shared/models/compare';

import * as S from '../ResourceSetSelectColor.styled';

type IProps = {
  side: CompareSide;
};

const GitCommitSelect: React.FC<IProps> = ({side}) => {
  const dispatch = useAppDispatch();
  const resourceSet = useAppSelector(state => selectGitResourceSet(state, side));
  invariant(resourceSet, 'invalid_state');

  const {currentCommit, currentGitBranch, currentGitBranchCommits} = resourceSet;

  const handleSelect = (commitHash: string) => {
    const value: PartialResourceSet = {type: 'git', branchName: currentGitBranch?.name, commitHash};
    dispatch(resourceSetSelected({side, value}));
  };

  if (!currentGitBranch) {
    return <Select disabled placeholder="Select commit..." style={{width: '100%'}} />;
  }

  return (
    <S.SelectColor style={{width: '100%'}}>
      <Select
        placeholder="Select commit..."
        style={{width: '100%'}}
        value={currentCommit?.hash}
        onSelect={handleSelect}
      >
        {currentGitBranchCommits.map(commit => (
          <Select.Option key={commit.hash} value={commit.hash}>
            <S.CommitDate>{gitCommitDate(commit.date)}</S.CommitDate>
            {commit.message}
            <S.CommitHash>{commit.hash.slice(0, 7)}</S.CommitHash>
          </Select.Option>
        ))}
      </Select>
    </S.SelectColor>
  );
};

export default GitCommitSelect;
