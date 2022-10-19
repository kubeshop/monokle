import {openGitCloneModal} from '@redux/git';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openCreateProjectModal, openFolderExplorer} from '@redux/reducers/ui';

import SelectFolder from '@assets/FromFolder.svg';
import CreateFromGit from '@assets/FromGit.svg';
import CreateScratch from '@assets/FromScratch.svg';
import CreateFromTemplate from '@assets/FromTemplate.svg';

import Guide from './Guide';
import * as S from './StartProjectPage.styled';

const StartProjectPage = () => {
  const dispatch = useAppDispatch();
  const isGitInstalled = useAppSelector(state => state.git.isGitInstalled);

  const handleOpenFolderExplorer = () => {
    dispatch(openFolderExplorer());
  };

  const handleCreateProject = (fromTemplate: boolean) => {
    dispatch(openCreateProjectModal({fromTemplate}));
  };

  const START_PROJECT_OPTIONS = [
    {
      disabled: false,
      itemId: 'select-existing-folder',
      itemLogo: SelectFolder,
      itemTitle: 'Select a folder',
      itemDescription: 'Have a local folder with ready-to-check Kubernetes resources? Bring it on!',
      itemAction: handleOpenFolderExplorer,
    },
    {
      disabled: !isGitInstalled,
      itemId: 'start-from-git',
      itemLogo: CreateFromGit,
      itemTitle: 'Clone a Git repo',
      itemDescription: 'Explore K8s resources from a public Git repo or one your own',
      itemAction: () => {
        dispatch(openGitCloneModal());
      },
    },
    {
      disabled: false,
      itemId: 'start-from-template',
      itemLogo: CreateFromTemplate,
      itemTitle: 'New project from template',
      itemDescription: 'Create basic K8s resources from ready-to-go templates',
      itemAction: () => handleCreateProject(true),
    },
    {
      disabled: false,
      itemId: 'create-empty-project',
      itemLogo: CreateScratch,
      itemTitle: 'Create a project',
      itemDescription: "Create an empty project. We'll help you along the way",
      itemAction: () => handleCreateProject(false),
    },
  ];

  return (
    <S.Container>
      <Guide />

      <S.InformationMessage>Choose your way to start your first project:</S.InformationMessage>

      <S.StartProjectContainer>
        {START_PROJECT_OPTIONS.map(item => {
          const {disabled, itemId, itemLogo, itemTitle, itemDescription, itemAction} = item;

          return (
            <S.StartProjectItem
              $disabled={disabled}
              key={itemId}
              id={itemId}
              onClick={() => {
                if (!disabled) {
                  itemAction();
                }
              }}
            >
              <S.StartProjectItemLogo src={itemLogo} />
              <S.StartProjectItemTitle $disabled={disabled}>{itemTitle}</S.StartProjectItemTitle>
              <S.StartProjectItemDescription $disabled={disabled}>{itemDescription}</S.StartProjectItemDescription>
            </S.StartProjectItem>
          );
        })}
      </S.StartProjectContainer>
    </S.Container>
  );
};

export default StartProjectPage;
