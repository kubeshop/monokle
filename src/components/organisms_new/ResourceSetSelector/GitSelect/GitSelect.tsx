import {selectGitResourceSet} from '@redux/compare/selectors';
import {useAppSelector} from '@redux/hooks';

import {CompareSide} from '@shared/models/compare';

import GitBranchSelect from './GitBranchSelect';
import GitCommitSelect from './GitCommitSelect';
import GitFolderSelect from './GitFolderSelect';

type IProps = {
  side: CompareSide;
};

const GitSelect: React.FC<IProps> = ({side}) => {
  const resourceSet = useAppSelector(state => selectGitResourceSet(state, side));

  return (
    <>
      <GitBranchSelect side={side} />
      <GitCommitSelect side={side} />

      {resourceSet?.currentCommit && resourceSet.currentGitBranch && <GitFolderSelect side={side} />}
    </>
  );
};

export default GitSelect;
