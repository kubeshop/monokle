import {useState} from 'react';

import {useAppDispatch} from '@redux/hooks';
import {openCreateProjectModal, openFolderExplorer} from '@redux/reducers/ui';

import SelectFolder from '@assets/FromFolder.svg';
import CreateFromGit from '@assets/FromGit.svg';
import CreateScratch from '@assets/FromScratch.svg';
import CreateFromTemplate from '@assets/FromTemplate.svg';

import GitCloneModal from '../PageHeader/GitCloneModal';
import Guide from './Guide';
import * as S from './StartProjectPage.styled';

const StartProjectPage = () => {
  const dispatch = useAppDispatch();
  const [isGitCloneModalVisible, setIsGitCloneModalVisible] = useState(false);

  const handleOpenFolderExplorer = () => {
    dispatch(openFolderExplorer());
  };

  const handleGitCloneRepo = () => {
    setIsGitCloneModalVisible(true);
  };

  const handleCreateProject = (fromTemplate: boolean) => {
    dispatch(openCreateProjectModal({fromTemplate}));
  };

  const START_PROJECT_OPTIONS = [
    {
      itemId: 'select-existing-folder',
      itemLogo: SelectFolder,
      itemTitle: 'Select a folder',
      itemDescription: 'Have a local folder with ready-to-check Kubernetes resources? Bring it on!',
      itemAction: handleOpenFolderExplorer,
    },
    {
      itemId: 'start-from-git',
      itemLogo: CreateFromGit,
      itemTitle: 'Clone a Git repo',
      itemDescription: 'Explore K8s resources from a public Git repo or one your own',
      itemAction: handleGitCloneRepo,
    },
    {
      itemId: 'start-from-template',
      itemLogo: CreateFromTemplate,
      itemTitle: 'New project from template',
      itemDescription: 'Create basic K8s resources from ready-to-go templates',
      itemAction: () => handleCreateProject(true),
    },
    {
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
          const {itemId, itemLogo, itemTitle, itemDescription, itemAction} = item;

          return (
            <S.StartProjectItem key={itemId} id={itemId} onClick={itemAction}>
              <S.StartProjectItemLogo src={itemLogo} />
              <S.StartProjectItemTitle>{itemTitle}</S.StartProjectItemTitle>
              <S.StartProjectItemDescription>{itemDescription}</S.StartProjectItemDescription>
            </S.StartProjectItem>
          );
        })}
      </S.StartProjectContainer>

      {isGitCloneModalVisible && (
        <GitCloneModal
          onComplete={() => setIsGitCloneModalVisible(false)}
          onCancel={() => setIsGitCloneModalVisible(false)}
        />
      )}
    </S.Container>
  );
};

export default StartProjectPage;
