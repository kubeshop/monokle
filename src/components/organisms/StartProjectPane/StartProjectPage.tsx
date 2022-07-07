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

  const START_PROJECT_OPTIONS = [
    {
      itemId: 'start-from-template',
      itemLogo: SelectFolder,
      itemTitle: 'Select a folder with K8s resources',
      itemDescription: 'Already have a local folder with ready-to-check Kubernetes resources? Bring it on!',
      itemAction: handleOpenFolderExplorer,
    },
    {
      itemId: 'create-empty-project',
      itemLogo: CreateScratch,
      itemTitle: 'Create a project from scratch',
      itemDescription: 'Create an empty project and new resources from scratch. We’ll help you along the way.',
      itemAction: () => handleCreateProject(false),
    },
    {
      itemId: 'select-existing-folder',
      itemLogo: CreateFromTemplate,
      itemTitle: 'Start from a template',
      itemDescription: 'Create basic jobs, pods, roles, services and other resources through ready-to-go templates.',
      itemAction: () => handleCreateProject(true),
    },
  ];

  return (
    <S.Container>
      <Guide />

      <S.InformationMessage>Choose your way to start your first project:</S.InformationMessage>

      <S.StartProjectContainer>
        {START_PROJECT_OPTIONS.map(item => {
          const {itemId, itemLogo, itemTitle, itemDescription, itemAction} = item;

          return (
            <S.StartProjectItem id={itemId} onClick={itemAction}>
              <S.StartProjectItemLogo src={itemLogo} />
              <S.StartProjectItemTitle>{itemTitle}</S.StartProjectItemTitle>
              <S.StartProjectItemDescription>{itemDescription}</S.StartProjectItemDescription>
            </S.StartProjectItem>
          );
        })}
      </S.StartProjectContainer>
    </S.Container>
  );
};

export default StartProjectPage;
