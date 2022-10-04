import {Select} from 'antd';

import invariant from 'tiny-invariant';

import {CompareSide, PartialResourceSet, resourceSetSelected, selectGitResourceSet} from '@redux/compare';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import * as S from '../ResourceSetSelectColor.styled';

type IProps = {
  side: CompareSide;
};

const GitBranchSelect: React.FC<IProps> = ({side}) => {
  const dispatch = useAppDispatch();
  const resourceSet = useAppSelector(state => selectGitResourceSet(state, side));
  invariant(resourceSet, 'invalid_state');

  const {allGitBranches, currentGitBranch} = resourceSet;

  const handleSelect = (branchName: string) => {
    // select latest commit by default if exists
    const commitHash = allGitBranches.find(b => b.name === branchName)?.commits?.[0].hash || '';

    const value: PartialResourceSet = {type: 'git', branchName, commitHash};
    dispatch(resourceSetSelected({side, value}));
  };

  return (
    <S.SelectColor>
      <Select
        onChange={handleSelect}
        placeholder="Choose Branch..."
        value={currentGitBranch?.name}
        style={{width: 200}}
      >
        {allGitBranches.map(branch => (
          <Select.Option key={branch.name} value={branch.name}>
            {branch.name}
          </Select.Option>
        ))}
      </Select>
    </S.SelectColor>
  );
};

export default GitBranchSelect;
