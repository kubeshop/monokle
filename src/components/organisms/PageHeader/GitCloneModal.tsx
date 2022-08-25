import {useState} from 'react';

import {Button, Input, Modal} from 'antd';

import {useAppDispatch} from '@redux/hooks';
import {setCreateProject} from '@redux/reducers/appConfig';

import {FileExplorer} from '@components/atoms';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {promiseFromIpcRenderer} from '@utils/promises';

type Props = {
  onComplete?: () => void;
};

const GitCloneModal = (props: Props) => {
  const {onComplete} = props;
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
    <Modal visible onOk={onOk} confirmLoading={isCloning}>
      <p>Local path:</p>
      <Input readOnly value={localPath} onChange={e => setLocalPath(e.target.value)} />
      <Button onClick={() => openFileExplorer()}>Browse</Button>
      <FileExplorer {...fileExplorerProps} />
      <p>Repo path:</p>
      <Input value={repoPath} onChange={e => setRepoPath(e.target.value)} />
    </Modal>
  );
};

export default GitCloneModal;
