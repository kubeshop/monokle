import {Dropdown} from 'antd';

import {useAppDispatch} from '@redux/hooks';
import {setCreateProject} from '@redux/reducers/appConfig';
import {openCreateProjectModal} from '@redux/reducers/ui';

import {FileExplorer} from '@atoms';

import {useFileExplorer} from '@hooks/useFileExplorer';

import * as S from './CreateProject.styled';

const CreateProject = () => {
  const dispatch = useAppDispatch();

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
  return (
    <S.DropdownContainer>
      <Dropdown
        overlay={
          <S.MenuContainer>
            <S.MenuItem onClick={openFileExplorer}>
              <S.MenuItemIcon>
                <S.FolderSmallWhite />
              </S.MenuItemIcon>
              <S.MenuItemLabel>New from local folder</S.MenuItemLabel>
            </S.MenuItem>
            <S.MenuItem
              onClick={() => {
                handleCreateProject(false);
              }}
            >
              <S.MenuItemIcon>
                <S.FolderSmallPlusWhite />
              </S.MenuItemIcon>
              <S.MenuItemLabel>New from scratch</S.MenuItemLabel>
            </S.MenuItem>
            <S.MenuItem
              onClick={() => {
                handleCreateProject(true);
              }}
            >
              <S.MenuItemIcon>
                <S.TemplateSmallWhite />
              </S.MenuItemIcon>
              <S.MenuItemLabel>New from template</S.MenuItemLabel>
            </S.MenuItem>
          </S.MenuContainer>
        }
        placement="bottomLeft"
        trigger={['click']}
      >
        <S.Button type="link" size="small">
          <S.PlusIcon />
        </S.Button>
      </Dropdown>
      <FileExplorer {...fileExplorerProps} />
    </S.DropdownContainer>
  );
};

export default CreateProject;
