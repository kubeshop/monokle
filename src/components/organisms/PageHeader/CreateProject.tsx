import {useMemo} from 'react';

import {Dropdown} from 'antd';
import {ItemType} from 'antd/lib/menu/hooks/useItems';

import {openGitCloneModal} from '@redux/git';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setCreateProject} from '@redux/reducers/appConfig';
import {openCreateProjectModal} from '@redux/reducers/ui';

import {FileExplorer, Icon} from '@atoms';

import {useFileExplorer} from '@hooks/useFileExplorer';

import FolderSmallPlusWhiteSvg from '@assets/FolderSmallPlusWhite.svg';
import FolderSmallWhiteSvg from '@assets/FolderSmallWhite.svg';
import PlusIconSvg from '@assets/PlusIcon.svg';
import TemplateSmallWhiteSvg from '@assets/TemplateSmallWhite.svg';

import * as S from './CreateProject.styled';

const CreateProject = () => {
  const dispatch = useAppDispatch();

  const isGitInstalled = useAppSelector(state => state.git.isGitInstalled);

  const items: ItemType[] = useMemo(
    () => [
      {label: 'New from local folder', key: 'new_from_local_folder', icon: <img src={FolderSmallWhiteSvg} />},
      {
        disabled: !isGitInstalled,
        label: 'New from Git repository',
        key: 'new_from_git_repo',
        icon: <Icon style={{width: 16, marginRight: 10, marginLeft: '-2px'}} name="git-repository" />,
      },
      {label: 'New from scratch', key: 'new_from_scratch', icon: <img src={FolderSmallPlusWhiteSvg} />},
      {label: 'New from template', key: 'new_from_template', icon: <img src={TemplateSmallWhiteSvg} />},
    ],
    [isGitInstalled]
  );

  const {openFileExplorer, fileExplorerProps} = useFileExplorer(
    ({folderPath}) => {
      if (folderPath) {
        dispatch(setCreateProject({rootFolder: folderPath}));
      }
    },
    {isDirectoryExplorer: true}
  );

  const handleCreateProject = (fromTemplate: boolean) => {
    dispatch(openCreateProjectModal({fromTemplate}));
  };

  const onMenuOptionClick = (item: Record<string, any>) => {
    const {key} = item;

    if (key === 'new_from_local_folder') {
      openFileExplorer();
    } else if (key === 'new_from_scratch') {
      handleCreateProject(false);
    } else if (key === 'new_from_template') {
      handleCreateProject(true);
    } else if (key === 'new_from_git_repo') {
      dispatch(openGitCloneModal());
    }
  };

  return (
    <S.DropdownContainer>
      <Dropdown
        overlay={<S.Menu items={items} onClick={onMenuOptionClick} />}
        placement="bottomLeft"
        trigger={['click']}
      >
        <S.Button type="link" size="small">
          <img src={PlusIconSvg} />
        </S.Button>
      </Dropdown>
      <FileExplorer {...fileExplorerProps} />
    </S.DropdownContainer>
  );
};

export default CreateProject;
