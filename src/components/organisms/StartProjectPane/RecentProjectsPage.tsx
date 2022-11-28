import {Button} from 'antd';

import {Project} from '@models/appconfig';

import {openGitCloneModal} from '@redux/git';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setOpenProject, sortProjects, toggleProjectPin} from '@redux/reducers/appConfig';
import {openCreateProjectModal, openFolderExplorer, toggleStartProjectPane} from '@redux/reducers/ui';
import {activeProjectSelector} from '@redux/selectors';

import SelectFolder from '@assets/FromFolder.svg';
import CreateFromGit from '@assets/FromGit.svg';
import QuickClusterPreview from '@assets/QuickClusterPreview.svg';

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
          <S.ActionItem $hasMultipleActions>
            <S.ActionItemLogo src={SelectFolder} />
            <S.ActionItemContext>
              <S.ActionItemText>New project</S.ActionItemText>
            </S.ActionItemContext>

            <S.MultipleActions>
              <Button id="select-existing-folder" size="large" type="primary" onClick={handleOpenFolderExplorer}>
                Open a local folder
              </Button>
              <Button id="start-from-template" size="large" type="primary" onClick={() => handleCreateProject(true)}>
                New from template
              </Button>
              <Button id="create-empty-project" size="large" type="primary" onClick={() => handleCreateProject(false)}>
                New empty project
              </Button>
            </S.MultipleActions>
          </S.ActionItem>

          <S.ActionItem
            $disabled={!isGitInstalled}
            id="start-from-git"
            onClick={() => {
              if (isGitInstalled) {
                dispatch(openGitCloneModal());
              }
            }}
          >
            <S.ActionItemLogo src={CreateFromGit} />
            <S.ActionItemContext>
              <S.ActionItemText>Clone a Git repo</S.ActionItemText>
            </S.ActionItemContext>
          </S.ActionItem>

          <S.ActionItem id="quick-cluster-preview" onClick={() => handleCreateProject(true)}>
            <S.ActionItemLogo src={QuickClusterPreview} />
            <S.ActionItemContext>
              <S.ActionItemText>Quick cluster preview</S.ActionItemText>
            </S.ActionItemContext>
          </S.ActionItem>
        </S.ActionItems>
      </S.Actions>
    </S.Container>
  );
};

export default NewRecentProjectsPane;
