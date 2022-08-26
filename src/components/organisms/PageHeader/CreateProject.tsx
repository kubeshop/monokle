import {useMemo, useState} from 'react';

import {Dropdown} from 'antd';
import {ItemType} from 'antd/lib/menu/hooks/useItems';

import {GithubOutlined} from '@ant-design/icons';

import {useAppDispatch} from '@redux/hooks';
import {setCreateProject} from '@redux/reducers/appConfig';
import {openCreateProjectModal} from '@redux/reducers/ui';

import {FileExplorer} from '@atoms';

import {useFileExplorer} from '@hooks/useFileExplorer';

import FolderSmallPlusWhiteSvg from '@assets/FolderSmallPlusWhite.svg';
import FolderSmallWhiteSvg from '@assets/FolderSmallWhite.svg';
import PlusIconSvg from '@assets/PlusIcon.svg';
import TemplateSmallWhiteSvg from '@assets/TemplateSmallWhite.svg';

import * as S from './CreateProject.styled';
import GitCloneModal from './GitCloneModal';

const CreateProject = () => {
  const dispatch = useAppDispatch();

  const [isGitCloneModalVisible, setIsGitCloneModalVisible] = useState(false);

  const items: ItemType[] = useMemo(
    () => [
      {label: 'New from local folder', key: 'new_from_local_folder', icon: <img src={FolderSmallWhiteSvg} />},
      {label: 'New from scratch', key: 'new_from_scratch', icon: <img src={FolderSmallPlusWhiteSvg} />},
      {label: 'New from template', key: 'new_from_template', icon: <img src={TemplateSmallWhiteSvg} />},
      {label: 'New from Git repository', key: 'new_from_git_repo', icon: <GithubOutlined />},
    ],
    []
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
      setIsGitCloneModalVisible(true);
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
      {isGitCloneModalVisible && (
        <GitCloneModal
          onComplete={() => setIsGitCloneModalVisible(false)}
          onCancel={() => setIsGitCloneModalVisible(false)}
        />
      )}
    </S.DropdownContainer>
  );
};

export default CreateProject;
