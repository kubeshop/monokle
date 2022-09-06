import {Space} from 'antd';

import {GitBranch} from '@models/git';

import {CopyButton} from '@components/atoms';

import * as S from './BranchCell.styled';

type Props = {
  onSelect: (branch: GitBranch) => void;
  branch: GitBranch;
};

export function NameCell({onSelect, branch}: Props) {
  return (
    <S.Box onClick={() => onSelect(branch)}>
      {branch.type === 'remote' ? <S.CloudOutlined /> : <S.BranchesOutlined />}

      <div>
        <Space size="small">
          <S.NameLabel>{branch.name}</S.NameLabel>
          <CopyButton content={branch.name} />
        </Space>

        <S.BranchUpdated>
          <S.CommitShaLabel>{branch.commitSha}</S.CommitShaLabel>
        </S.BranchUpdated>
      </div>
    </S.Box>
  );
}
