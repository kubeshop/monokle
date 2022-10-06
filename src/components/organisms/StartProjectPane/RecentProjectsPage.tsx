import {Project} from '@models/appconfig';

import {openGitCloneModal} from '@redux/git';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setOpenProject, sortProjects, toggleProjectPin} from '@redux/reducers/appConfig';
import {openCreateProjectModal, openFolderExplorer, toggleStartProjectPane} from '@redux/reducers/ui';
import {activeProjectSelector} from '@redux/selectors';

import {GitCloneModal} from '@organisms';

import SelectFolder from '@assets/FromFolder.svg';
import CreateFromGit from '@assets/FromGit.svg';
import CreateScratch from '@assets/FromScratch.svg';
import CreateFromTemplate from '@assets/FromTemplate.svg';

import Guide from './Guide';
import RecentProject from './RecentProject';
import * as S from './RecentProjectsPage.styled';

const NewRecentProjectsPane = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const isGitCloneModalVisible = useAppSelector(state => state.git.gitCloneModal.open);
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
        <S.ProjectsTitle id="recent-project-title">Select a project...</S.ProjectsTitle>

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
        <S.ActionsTitle>... or create a new one</S.ActionsTitle>

        <S.ActionItems>
          <S.ActionItem id="select-existing-folder" onClick={handleOpenFolderExplorer}>
            <S.ActionItemLogo src={SelectFolder} />
            <S.ActionItemContext>
              <S.ActionItemText>Select a local folder</S.ActionItemText>
            </S.ActionItemContext>
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

          <S.ActionItem id="start-from-template" onClick={() => handleCreateProject(true)}>
            <S.ActionItemLogo src={CreateFromTemplate} />
            <S.ActionItemContext>
              <S.ActionItemText>New project from template</S.ActionItemText>
            </S.ActionItemContext>
          </S.ActionItem>

          <S.ActionItem id="create-empty-project" onClick={() => handleCreateProject(false)}>
            <S.ActionItemLogo src={CreateScratch} />
            <S.ActionItemContext>
              <S.ActionItemText>New project from scratch</S.ActionItemText>
            </S.ActionItemContext>
          </S.ActionItem>
        </S.ActionItems>
      </S.Actions>

      {isGitCloneModalVisible && <GitCloneModal />}
    </S.Container>
  );
};

export default NewRecentProjectsPane;
