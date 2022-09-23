import {useCallback, useState} from 'react';

import {Modal} from 'antd';

import {BranchesOutlined} from '@ant-design/icons';

import {GitBranch} from '@models/git';

import {setCurrentBranch} from '@redux/git';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {rootFolderSelector} from '@redux/selectors';

import {TableSelect} from '@atoms';

import {promiseFromIpcRenderer} from '@utils/promises';

import BranchTable from './BranchTable';

function BranchSelect() {
  const dispatch = useAppDispatch();

  const [visible, setVisible] = useState(false);

  const currentBranch = useAppSelector(state => state.git.repo?.currentBranch);

  const rootFolderPath = useAppSelector(rootFolderSelector);

  const handleTableToggle = useCallback(
    (newVisible: boolean) => {
      setVisible(newVisible);
    },
    [setVisible]
  );

  const handleSelect = useCallback(
    (branch: GitBranch) => {
      promiseFromIpcRenderer('git.checkoutGitBranch', 'git.checkoutGitBranch.result', {
        localPath: rootFolderPath,
        branchName: branch.type === 'local' ? branch.name : branch.name.replace('origin/', ''),
      }).then(result => {
        if (result.error) {
          Modal.warning({
            title: 'Checkout not possible',
            content: <div>Please commit your changes or stash them before you switch branches.</div>,
            zIndex: 100000,
          });
        } else {
          dispatch(setCurrentBranch(branch.type === 'local' ? branch.name : branch.name.replace('origin/', '')));
          setVisible(false);
        }
      });
    },
    [rootFolderPath, dispatch]
  );

  return (
    <TableSelect
      value={currentBranch || 'default'}
      icon={<BranchesOutlined />}
      table={<BranchTable onSelect={handleSelect} />}
      tablePlacement="bottomLeft"
      tableVisible={visible}
      onTableToggle={handleTableToggle}
    />
  );
}

export default BranchSelect;
