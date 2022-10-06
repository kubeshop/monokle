import {CompareSide} from '@redux/compare';

import GitBranchSelect from './GitBranchSelect';
import GitCommitSelect from './GitCommitSelect';

type IProps = {
  side: CompareSide;
};

const GitSelect: React.FC<IProps> = ({side}) => {
  return (
    <>
      <GitBranchSelect side={side} />
      <GitCommitSelect side={side} />
    </>
  );
};

export default GitSelect;
