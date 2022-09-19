import {Space} from 'antd';

import {GitBranch} from '@models/git';

import {CopyButton} from '@components/atoms';

import * as S from './BranchCell.styled';

type IProps = {
  branch: GitBranch;
};

const BranchCell: React.FC<IProps> = props => {
  const {branch} = props;

  const deleteBranch = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    e.stopPropagation();
    console.log('Deleting local branch...');
  };

  return (
    <S.Box>
      <S.BranchInfo>
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
      </S.BranchInfo>

      <S.DeleteOutlined onClick={deleteBranch} />
    </S.Box>
  );
};

export default BranchCell;
