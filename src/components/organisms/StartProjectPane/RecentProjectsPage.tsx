import {Button} from 'antd';

import {openGitCloneModal} from '@redux/git';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setOpenProject, sortProjects, toggleProjectPin} from '@redux/reducers/appConfig';
import {
  openCreateProjectModal,
  openFolderExplorer,
  setLeftMenuSelection,
  setPreviewingCluster,
  toggleStartProjectPane,
} from '@redux/reducers/ui';

import SelectFolder from '@assets/FromFolder.svg';
import CreateFromGit from '@assets/FromGit.svg';
import QuickClusterPreview from '@assets/QuickClusterPreview.svg';

import {Project} from '@shared/models/config';
import {activeProjectSelector} from '@shared/utils/selectors';

import ActionCard from './ActionCard';
import Guide from './Guide';
import RecentProject from './RecentProject';
import * as S from './RecentProjectsPage.styled';

const NewRecentProjectsPane = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const isGitInstalled = useAppSelector(state => state.git.isGitInstalled);
  const projects = useAppSelector(state => state.config.projects);

  const openProject = (project: Project) => {
    dispatch(setOpenProject(project.rootFolder));
  };

  const onProjectItemClick = (isActiveProject: boolean, project: Project) => {
    if (isActiveProject) {
      dispatch(toggleStartProjectPane());
      return;
    }
    openProject(project);
  };

  const handleOpenFolderExplorer = () => {
    dispatch(openFolderExplorer());
  };

  const handleCreateProject = (fromTemplate: boolean) => {
    dispatch(openCreateProjectModal({fromTemplate}));
  };

  const handleOnProjectPinChange = (project: Project) => {
    dispatch(toggleProjectPin(project));
  };

  return (
    <S.Container>
      <Guide />

      <S.Projects>
        <S.ProjectsTitle id="recent-project-title">Select something recent…</S.ProjectsTitle>

        <S.ProjectsContainerWrapper>
          <S.ProjectsContainer id="recent-projects-container">
            {sortProjects(projects, Boolean(activeProject)).map((project: Project) => (
              <RecentProject
                key={project.rootFolder}
                project={project}
                isActive={project.rootFolder === activeProject?.rootFolder}
                onProjectItemClick={onProjectItemClick}
                onPinChange={() => handleOnProjectPinChange(project)}
              />
            ))}
          </S.ProjectsContainer>
        </S.ProjectsContainerWrapper>
      </S.Projects>

      <S.Actions>
        <S.ActionsTitle>… or start something new</S.ActionsTitle>

        <S.ActionItems>
          <ActionCard
            logo={SelectFolder}
            title="New project"
            multipleActions={
              <>
                <Button id="select-existing-folder" size="large" type="primary" onClick={handleOpenFolderExplorer}>
                  Open a local folder
                </Button>
                <Button id="start-from-template" size="large" type="primary" onClick={() => handleCreateProject(true)}>
                  New from template
                </Button>
                <Button
                  id="create-empty-project"
                  size="large"
                  type="primary"
                  onClick={() => handleCreateProject(false)}
                >
                  New empty project
                </Button>
              </>
            }
          />

          <ActionCard
            disabled={!isGitInstalled}
            id="start-from-git"
            logo={CreateFromGit}
            title="Clone a Git repo"
            onClick={() => {
              if (isGitInstalled) {
                dispatch(openGitCloneModal());
              }
            }}
          />

          <ActionCard
            id="quick-cluster-preview"
            logo={QuickClusterPreview}
            title="Quick cluster preview"
            onClick={() => {
              if (!activeProject) {
                dispatch(setPreviewingCluster(true));
              }

              dispatch(setLeftMenuSelection('dashboard'));
              dispatch(toggleStartProjectPane());
            }}
          />
        </S.ActionItems>
      </S.Actions>
    </S.Container>
  );
};

export default NewRecentProjectsPane;
