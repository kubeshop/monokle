import {openGitCloneModal} from '@redux/git';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openCreateProjectModal, openFolderExplorer} from '@redux/reducers/ui';

import SelectFolder from '@assets/FromFolder.svg';
import CreateFromGit from '@assets/FromGit.svg';
import CreateFromScratch from '@assets/FromScratch.svg';
import CreateFromTemplate from '@assets/FromTemplate.svg';

import ActionCard from './ActionCard';
import * as S from './NewProject.styled';

const NewProject: React.FC = () => {
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
      itemTitle: 'Select a folder with K8s resources',
      itemDescription: 'Already have a local folder with ready-to-check Kubernetes resources? Bring it on!',
      itemAction: handleOpenFolderExplorer,
    },
    {
      disabled: false,
      itemId: 'create-empty-project',
      itemLogo: CreateFromScratch,
      itemTitle: 'Create from scratch',
      itemDescription: "Create an empty project and new resources from scratch. We'll help you along the way.",
      itemAction: () => handleCreateProject(false),
    },
    {
      disabled: false,
      itemId: 'start-from-template',
      itemLogo: CreateFromTemplate,
      itemTitle: 'Start from a template',
      itemDescription: 'Create basic jobs, pods, roles, services and other resources through ready-to-go templates.',
      itemAction: () => handleCreateProject(true),
    },
    {
      disabled: !isGitInstalled,
      itemId: 'start-from-git',
      itemLogo: CreateFromGit,
      itemTitle: 'Clone a Git repo',
      itemDescription: 'Explore K8s resources from a public Git repo or one your own.',
      itemAction: () => {
        if (isGitInstalled) {
          dispatch(openGitCloneModal());
        }
      },
    },
  ];

  return (
    <S.NewProjectContainer>
      {START_PROJECT_OPTIONS.map(item => {
        const {disabled, itemId, itemLogo, itemTitle, itemDescription, itemAction} = item;

        return (
          <ActionCard
            description={itemDescription}
            disabled={disabled}
            key={itemId}
            id={itemId}
            logo={itemLogo}
            title={itemTitle}
            onClick={itemAction}
            size="big"
          />
        );
      })}
    </S.NewProjectContainer>
  );
};

export default NewProject;
