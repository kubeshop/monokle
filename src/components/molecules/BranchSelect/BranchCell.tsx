import {Modal, Space} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {CopyButton} from '@components/atoms';

import {promiseFromIpcRenderer} from '@utils/promises';
import {showGitErrorModal} from '@utils/terminal';

import {GitBranch} from '@shared/models/git';

import * as S from './BranchCell.styled';

type IProps = {
  branch: GitBranch;
};

const BranchCell: React.FC<IProps> = props => {
  const {branch} = props;

  const dispatch = useAppDispatch();
  const currentBranch = useAppSelector(state => state.git.repo?.currentBranch);
  const selectedProjectRootFolder = useAppSelector(state => state.config.selectedProjectRootFolder);

  const deleteBranch = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    e.stopPropagation();

    Modal.confirm({
      title: `Are you sure you want to delete ${branch.name}?`,
      onOk() {
        promiseFromIpcRenderer('git.deleteLocalBranch', 'git.deleteLocalBranch.result', {
          localPath: selectedProjectRootFolder,
          branchName: branch.name,
        }).then(result => {
          if (result.error) {
            showGitErrorModal(`Deleting ${branch.name} failed`, `git branch -d ${branch.name}`, dispatch);
          }
        });
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
