import {useMemo} from 'react';

import {Menu} from 'antd';

import {GitChangedFile} from '@models/git';

import {useAppSelector} from '@redux/hooks';

import {promiseFromIpcRenderer} from '@utils/promises';

type IProps = {
  items: GitChangedFile[];
  showStageUnstageOption?: boolean;
};

const DropdownMenu: React.FC<IProps> = props => {
  const {items, showStageUnstageOption} = props;

  const selectedProjectRootFolder = useAppSelector(state => state.config.selectedProjectRootFolder);

  const menuItems = useMemo(
    () => [
      // {
      //   key: 'commit_to_new',
      //   label: "Commit to a new branch & PR",
      // },
      {
        key: 'commit_to_main',
        label: 'Commit to the main branch',
      },
      ...(showStageUnstageOption
        ? [
            {
              key: 'stage_unstage_changes',
              label: items[0].status === 'staged' ? 'Unstage changes' : 'Stage changes',
              onClick: () => {
                if (!items?.length) {
                  return;
                }

                if (items[0].status === 'unstaged') {
                  promiseFromIpcRenderer('git.stageChangedFiles', 'git.stageChangedFiles.result', {
                    localPath: selectedProjectRootFolder,
                    filePaths: items.map(item => item.path),
                  });
                } else {
                  promiseFromIpcRenderer('git.unstageFiles', 'git.unstageFiles.result', {
                    localPath: selectedProjectRootFolder,
                    filePaths: items.map(item => item.path),
                  });
                }
              },
            },
          ]
        : []),

      // {
      //   key: 'diff',
      //   label: <div>Diff</div>,
      // },
      // {
      //   key: 'rollback',
      //   label: <div>Rollback</div>,
      // },
    ],
    [items, selectedProjectRootFolder, showStageUnstageOption]
  );

  return <Menu items={menuItems} />;
};

export default DropdownMenu;
