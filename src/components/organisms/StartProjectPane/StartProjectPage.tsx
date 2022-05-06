import {useAppDispatch} from '@redux/hooks';
import {openCreateProjectModal, openFolderExplorer} from '@redux/reducers/ui';

import SelectFolder from '@assets/FromFolder.svg';
import CreateScratch from '@assets/FromScratch.svg';
import CreateFromTemplate from '@assets/FromTemplate.svg';

import Guide from './Guide';
import * as S from './StartProjectPage.styled';

const StartProjectPage = () => {
  const dispatch = useAppDispatch();

  const handleOpenFolderExplorer = () => {
    dispatch(openFolderExplorer());
  };

  const handleCreateProject = (fromTemplate: boolean) => {
    dispatch(openCreateProjectModal({fromTemplate}));
  };
  return (
    <S.Container>
      <Guide />

      <S.InformationMessage>Choose your way to start your first project:</S.InformationMessage>

      <S.StartProjectContainer>
        <S.StartProjectItem>
          <S.StartProjectItemLogo src={SelectFolder} />
          <S.StartProjectItemTitle>Select a folder with K8s resources</S.StartProjectItemTitle>
          <S.StartProjectItemDescription>
            Already have a local folder with ready-to-check Kubernetes resources? Bring it on!
          </S.StartProjectItemDescription>
          <S.StartProjectItemButton id="select-existing-folder" onClick={handleOpenFolderExplorer}>
            Open
          </S.StartProjectItemButton>
        </S.StartProjectItem>

        <S.StartProjectItem>
          <S.StartProjectItemLogo src={CreateScratch} />
          <S.StartProjectItemTitle>Create a project from scratch</S.StartProjectItemTitle>
          <S.StartProjectItemDescription>
            Create an empty project and new resources from scratch. We’ll help you along the way.
          </S.StartProjectItemDescription>
          <S.StartProjectItemButton id="create-empty-project" onClick={() => handleCreateProject(false)}>
            Create
          </S.StartProjectItemButton>
        </S.StartProjectItem>

        <S.StartProjectItem>
          <S.StartProjectItemLogo src={CreateFromTemplate} />
          <S.StartProjectItemTitle>Start from a template</S.StartProjectItemTitle>
          <S.StartProjectItemDescription>
            Create basic jobs, pods, roles, services and other resources through ready-to-go templates.
          </S.StartProjectItemDescription>
          <S.StartProjectItemButton id="start-from-template" onClick={() => handleCreateProject(true)}>
            Select Template
          </S.StartProjectItemButton>
        </S.StartProjectItem>
      </S.StartProjectContainer>
    </S.Container>
  );
};

export default StartProjectPage;
