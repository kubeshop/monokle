import {Space} from 'antd';

import styled from 'styled-components';

import {GitBranch} from '@models/git';

import {CopyButton} from '@components/atoms';

import Colors from '@styles/Colors';

type Props = {
  onSelect: (branch: GitBranch) => void;
  branch: GitBranch;
};

export function NameCell({onSelect, branch}: Props) {
  return (
    <Box onClick={() => onSelect(branch)}>
      <Space size="small">
        <NameLabel>{branch.name}</NameLabel>
        <CopyButton content={branch.name} />
      </Space>

      <BranchUpdated>
        {/* <Icon name="commit" color={Colors.grey7} size="sm" style={{paddingTop: 2}} /> */}
        <span style={{marginLeft: 6}}>{branch.commitSha}</span>
      </BranchUpdated>
    </Box>
  );
}

const Box = styled.div`
  display: flex;
  flex-direction: column;
  cursor: pointer;
`;

const NameLabel = styled.div`
  max-width: 375px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const BranchUpdated = styled.span`
  display: flex;
  height: 16px;
  font-size: 12px;
  font-weight: 400;
  color: ${Colors.grey7};
`;
