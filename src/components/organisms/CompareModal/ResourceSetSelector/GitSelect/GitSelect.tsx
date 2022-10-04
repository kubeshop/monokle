import {Space} from 'antd';

import {CompareSide} from '@redux/compare';

import GitBranchSelect from './GitBranchSelect';

type IProps = {
  side: CompareSide;
};

const GitSelect: React.FC<IProps> = ({side}) => {
  return (
    <Space wrap>
      <GitBranchSelect side={side} />
    </Space>
  );
};

export default GitSelect;
