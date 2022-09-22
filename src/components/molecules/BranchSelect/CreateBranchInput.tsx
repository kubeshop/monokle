import {useEffect, useState} from 'react';

import {Button, Input, Tooltip} from 'antd';

import {CheckOutlined} from '@ant-design/icons';

import {TOOLTIP_DELAY} from '@constants/constants';
import {CommitTooltip} from '@constants/tooltips';

import {useAppSelector} from '@redux/hooks';

import {promiseFromIpcRenderer} from '@utils/promises';

import * as S from './CreateBranchInput.styled';

type IProps = {
  hideCreateBranchInputHandler: () => void;
};

const CreateBranchInput: React.FC<IProps> = props => {
  const {hideCreateBranchInputHandler} = props;

  const selectedProjectRootFolder = useAppSelector(state => state.config.selectedProjectRootFolder);

  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [branchName, setBranchName] = useState('');

  const handleCommit = async () => {
    if (!branchName) {
      setErrorMessage('Branch name must not be empty!');
      return;
    }

    setLoading(true);

    await promiseFromIpcRenderer('git.createLocalBranch', 'git.createLocalBranch.result', {
      localPath: selectedProjectRootFolder,
      branchName,
    });

    setBranchName('');
    setLoading(false);
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
          <Button loading={loading} type="primary" onClick={handleCommit}>
            <CheckOutlined />
          </Button>
        </Tooltip>
      </S.CreateBranchInputContainer>

      {errorMessage ? <S.ErrorLabel>{errorMessage}</S.ErrorLabel> : null}
    </>
  );
};

export default CreateBranchInput;
