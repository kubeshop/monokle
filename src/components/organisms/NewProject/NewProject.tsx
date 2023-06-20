import {openGitCloneModal} from '@redux/git';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  openCreateProjectModal,
  openFolderExplorer,
  openHelmRepoModal,
  setIsInQuickClusterMode,
  setLeftMenuSelection,
  toggleStartProjectPane,
} from '@redux/reducers/ui';

import ClusterLive from '@assets/newProject/ClusterLive.svg';
import SelectFolder from '@assets/newProject/FromFolder.svg';
import CreateFromGit from '@assets/newProject/FromGit.svg';
import CreateFromHelm from '@assets/newProject/FromHelm.svg';
import SampleProject from '@assets/newProject/FromSampleProject.svg';
import CreateFromScratch from '@assets/newProject/FromScratch.svg';
import CreateFromTemplate from '@assets/newProject/FromTemplate.svg';

import {trackEvent} from '@shared/utils/telemetry';

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

  const handleOpenLiveCluster = () => {
    trackEvent('dashboard/open', {from: 'start-screen-new-project-live-cluster'});
    dispatch(setLeftMenuSelection('dashboard'));
    dispatch(setIsInQuickClusterMode(true));
    dispatch(toggleStartProjectPane());
  };

  const START_PROJECT_OPTIONS = [
    {
      disabled: false,
      itemId: 'sample-project',
      itemLogo: SampleProject,
      itemTitle: 'Sample project',
      itemDescription:
        'Not sure where to start? Explore a sample project containing everything you need to get started with just one click.',
      itemAction: () => {
        dispatch(openGitCloneModal({fromSampleProject: true}));
        trackEvent('app_start/create_project', {from: 'sample'});
      },
    },
    {
      disabled: false,
      itemId: 'cluster-live',
      itemLogo: ClusterLive,
      itemTitle: 'Explore your Cluster',
      itemDescription: 'Quickly connect to your cluster and check out activity, performance, misconfigurations & more.',
      itemAction: handleOpenLiveCluster,
    },
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
          dispatch(openGitCloneModal({}));
        }
      },
    },
    {
      disabled: false,
      itemId: 'start-from-helm',
      itemLogo: CreateFromHelm,
      itemTitle: 'Start from a Helm Chart',
      itemDescription: 'Create a new project from a Helm Chart in a Helm repository, and save it locally.',
      itemAction: () => {
        dispatch(openHelmRepoModal());
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
