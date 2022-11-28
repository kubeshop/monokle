import {Button} from 'antd';

import {openGitCloneModal} from '@redux/git';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openCreateProjectModal, openFolderExplorer} from '@redux/reducers/ui';

import SelectFolder from '@assets/FromFolder.svg';
import CreateFromGit from '@assets/FromGit.svg';
import QuickClusterPreview from '@assets/QuickClusterPreview.svg';

import ActionCard from './ActionCard';
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
      itemLogo: SelectFolder,
      itemTitle: 'New project',
      itemDescription: 'Upload a local folder, start from a template or completely from scratch!',
      multipleActions: (
        <>
          <Button id="select-existing-folder" size="large" type="primary" onClick={handleOpenFolderExplorer}>
            Open a local folder
          </Button>
          <Button id="start-from-template" size="large" type="primary" onClick={() => handleCreateProject(true)}>
            New from template
          </Button>
          <Button id="create-empty-project" size="large" type="primary" onClick={() => handleCreateProject(false)}>
            New empty project
          </Button>
        </>
      ),
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
    {
      disabled: false,
      itemId: 'quick-cluster-preview',
      itemLogo: QuickClusterPreview,
      itemTitle: 'Quick cluster preview',
      itemDescription: 'Preview a cluster and learn everything about it in a matter of seconds.',
    },
  ];

  return (
    <S.Container>
      <Guide />

      <S.StartProjectContainer>
        <S.InformationMessage>Start something new</S.InformationMessage>

        <S.StartProjectOptions>
          {START_PROJECT_OPTIONS.map(item => {
            const {disabled, itemId, itemLogo, itemTitle, itemDescription, itemAction, multipleActions} = item;

            return (
              <ActionCard
                description={itemDescription}
                disabled={disabled}
                id={itemId}
                logo={itemLogo}
                multipleActions={multipleActions}
                title={itemTitle}
                onClick={itemAction}
                size="big"
              />
            );
          })}
        </S.StartProjectOptions>
      </S.StartProjectContainer>
    </S.Container>
  );
};

export default StartProjectPage;
