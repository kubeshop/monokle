import {useEffect, useState} from 'react';

import {Button, Input, Tooltip} from 'antd';

import {CheckOutlined} from '@ant-design/icons';

import {TOOLTIP_DELAY} from '@constants/constants';
import {CommitTooltip} from '@constants/tooltips';

import {setCurrentBranch, setGitLoading, setRepo} from '@redux/git';
import {createLocalBranch, getRepoInfo} from '@redux/git/git.ipc';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {showGitErrorModal} from '@utils/terminal';

import * as S from './CreateBranchInput.styled';

type IProps = {
  hideCreateBranchInputHandler: () => void;
};

const CreateBranchInput: React.FC<IProps> = props => {
  const dispatch = useAppDispatch();
  const {hideCreateBranchInputHandler} = props;
  const isLoading = useAppSelector(state => state.git.loading);
  const projectRootFolder = useAppSelector(state => state.config.selectedProjectRootFolder);
  const gitRepoBranches = useAppSelector(state => state.git.repo?.branches || []);
  const selectedProjectRootFolder = useAppSelector(state => state.config.selectedProjectRootFolder) || '';

  const [errorMessage, setErrorMessage] = useState('');
  const [branchName, setBranchName] = useState('');

  const handleCommit = async () => {
    if (!branchName) {
      setErrorMessage('Branch name must not be empty!');
      return;
    }

    if (gitRepoBranches.includes(branchName)) {
      setErrorMessage('Branch name already exists!');
      return;
    }

    dispatch(setGitLoading(true));

    try {
      await createLocalBranch({localPath: selectedProjectRootFolder, branchName});
    } catch (e) {
      showGitErrorModal(`Creating ${branchName} failed`, undefined, `git checkout -b ${branchName}`, dispatch);
      setBranchName('');
      return;
    }

    setBranchName('');

    try {
      const repo = await getRepoInfo({path: projectRootFolder || ''});
      dispatch(setRepo(repo));
      dispatch(setCurrentBranch(branchName));
      dispatch(setGitLoading(false));
    } catch (e: any) {
      showGitErrorModal('Git repo error', e.message);
    }

    hideCreateBranchInputHandler();
  };

  useEffect(() => {
    return () => {
      hideCreateBranchInputHandler();
    };
  }, [hideCreateBranchInputHandler]);

  return (
    <>
      <S.CreateBranchInputContainer>
        <Input
          onChange={e => {
            setBranchName(e.currentTarget.value);

            if (errorMessage) {
              setErrorMessage('');
            }
          }}
          value={branchName}
          placeholder="Branch name"
        />

        <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={CommitTooltip}>
          <Button loading={isLoading} type="primary" onClick={handleCommit}>
            <CheckOutlined />
          </Button>
        </Tooltip>
      </S.CreateBranchInputContainer>

      {errorMessage ? <S.ErrorLabel>{errorMessage}</S.ErrorLabel> : null}
    </>
  );
};

export default CreateBranchInput;
