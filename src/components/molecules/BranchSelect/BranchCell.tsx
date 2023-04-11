import {Modal, Space} from 'antd';

import {deleteLocalBranch} from '@redux/git/service';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';

import {CopyButton} from '@components/atoms';

import {showGitErrorModal} from '@utils/terminal';

import {AlertEnum} from '@shared/models/alert';
import {GitBranch} from '@shared/models/git';

import * as S from './BranchCell.styled';

type IProps = {
  branch: GitBranch;
};

const BranchCell: React.FC<IProps> = props => {
  const {branch} = props;

  const dispatch = useAppDispatch();
  const currentBranch = useAppSelector(state => state.git.repo?.currentBranch);
  const selectedProjectRootFolder = useAppSelector(state => state.config.selectedProjectRootFolder) || '';

  const deleteBranch = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    e.stopPropagation();

    Modal.confirm({
      title: `Are you sure you want to delete ${branch.name}?`,
      onOk() {
        try {
          deleteLocalBranch({localPath: selectedProjectRootFolder, branchName: branch.name});
          dispatch(
            setAlert({type: AlertEnum.Success, title: `Branch ${branch.name} deleted successfully`, message: ''})
          );
        } catch (err) {
          showGitErrorModal(`Deleting ${branch.name} failed`, undefined, `git branch -d ${branch.name}`, dispatch);
        }
      },
      onCancel() {},
      zIndex: 100000,
    });
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

      {branch.type !== 'remote' && branch.name !== currentBranch ? <S.DeleteOutlined onClick={deleteBranch} /> : null}
    </S.Box>
  );
};

export default BranchCell;
