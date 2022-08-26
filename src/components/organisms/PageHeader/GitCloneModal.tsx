import {useState} from 'react';

import {Button, Input, Modal} from 'antd';

import {useAppDispatch} from '@redux/hooks';
import {setCreateProject} from '@redux/reducers/appConfig';

import {FileExplorer} from '@components/atoms';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {promiseFromIpcRenderer} from '@utils/promises';

import * as S from './GitCloneModal.styled';

type Props = {
  onCancel?: () => void;
  onComplete?: () => void;
};

const GitCloneModal = (props: Props) => {
  const {onComplete, onCancel} = props;
  const dispatch = useAppDispatch();
  const [localPath, setLocalPath] = useState<string>();
  const [repoPath, setRepoPath] = useState<string>();
  const [isCloning, setIsCloning] = useState<boolean>(false);

  const {openFileExplorer, fileExplorerProps} = useFileExplorer(
    ({folderPath}) => {
      if (folderPath) {
        setLocalPath(folderPath);
      }
    },
    {isDirectoryExplorer: true}
  );

  const onOk = async () => {
    if (!localPath || !repoPath) {
      return;
    }
    setIsCloning(true);
    promiseFromIpcRenderer('git.cloneGitRepo', 'git.cloneGitRepo.result', {localPath, repoPath}).then(() => {
      setIsCloning(false);
      dispatch(setCreateProject({rootFolder: localPath}));
      onComplete && onComplete();
    });
  };

  return (
    <Modal visible onOk={onOk} confirmLoading={isCloning} onCancel={onCancel}>
      <S.FieldLabel>Project location:</S.FieldLabel>
      <S.LocalPathField>
        <Input readOnly value={localPath} onChange={e => setLocalPath(e.target.value)} />
        <Button onClick={() => openFileExplorer()}>Browse</Button>
      </S.LocalPathField>
      <FileExplorer {...fileExplorerProps} />
      <S.FieldLabel>Repository URL:</S.FieldLabel>
      <Input
        value={repoPath}
        onChange={e => setRepoPath(e.target.value)}
        placeholder="https://github.com/kubeshop/monokle"
      />
    </Modal>
  );
};

export default GitCloneModal;
