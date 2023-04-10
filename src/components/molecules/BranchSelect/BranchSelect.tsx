import {useCallback, useState} from 'react';

import {BranchesOutlined} from '@ant-design/icons';

import {setCurrentBranch} from '@redux/git';
import {checkoutGitBranch} from '@redux/git/service';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {rootFolderSelector} from '@redux/selectors';

import {TableSelect} from '@atoms';

import {showGitErrorModal} from '@utils/terminal';

import {GitBranch} from '@shared/models/git';

import BranchTable from './BranchTable';

function BranchSelect() {
  const dispatch = useAppDispatch();

  const currentBranch = useAppSelector(state => state.git.repo?.currentBranch);
  const rootFolderPath = useAppSelector(rootFolderSelector);

  const [visible, setVisible] = useState(false);

  const handleTableToggle = useCallback(
    (newVisible: boolean) => {
      setVisible(newVisible);
    },
    [setVisible]
  );

  const handleSelect = useCallback(
    (branch: GitBranch) => {
      const branchName = branch.type === 'local' ? branch.name : branch.name.replace('origin/', '');

      try {
        checkoutGitBranch({localPath: rootFolderPath, branchName}).then(() => {
          dispatch(setCurrentBranch(branchName));
          setVisible(false);
        });
      } catch (e) {
        showGitErrorModal('Checkout failed', `git checkout -b ${branchName}`, dispatch);
      }
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
