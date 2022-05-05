import {Project} from '@models/appconfig';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setOpenProject, sortProjects, toggleProjectPin} from '@redux/reducers/appConfig';
import {openCreateProjectModal, openFolderExplorer, toggleStartProjectPane} from '@redux/reducers/ui';
import {activeProjectSelector} from '@redux/selectors';

import SelectFolder from '@assets/FromFolder.svg';
import CreateScratch from '@assets/FromScratch.svg';
import CreateFromTemplate from '@assets/FromTemplate.svg';

import Guide from './Guide';
import RecentProject from './RecentProject';
import * as S from './RecentProjectsPage.styled';

const NewRecentProjectsPane = () => {
  const dispatch = useAppDispatch();
  const projects = useAppSelector(state => state.config.projects);
  const activeProject = useAppSelector(activeProjectSelector);

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
        <S.ProjectsTitle id="recent-project-title">Recent Projects</S.ProjectsTitle>
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
      </S.Projects>

      <S.Actions>
        <S.ActionsTitle>Start a new project</S.ActionsTitle>
        <S.ActionItems>
          <S.ActionItem>
            <S.ActionItemLogo src={SelectFolder} />
            <S.ActionItemContext>
              <S.ActionItemText>Select a folder with k8s resources</S.ActionItemText>
              <S.ActionItemButton id="select-existing-folder" type="link" onClick={handleOpenFolderExplorer}>
                Open
              </S.ActionItemButton>
            </S.ActionItemContext>
          </S.ActionItem>
          <S.ActionItem>
            <S.ActionItemLogo src={CreateScratch} />
            <S.ActionItemContext>
              <S.ActionItemText>Create a project from scratch</S.ActionItemText>
              <S.ActionItemButton id="create-empty-project" type="link" onClick={() => handleCreateProject(false)}>
                Create
              </S.ActionItemButton>
            </S.ActionItemContext>
          </S.ActionItem>
          <S.ActionItem>
            <S.ActionItemLogo src={CreateFromTemplate} />
            <S.ActionItemContext>
              <S.ActionItemText>Start from a template</S.ActionItemText>
              <S.ActionItemButton id="start-from-template" type="link" onClick={() => handleCreateProject(true)}>
                Select template
              </S.ActionItemButton>
            </S.ActionItemContext>
          </S.ActionItem>
        </S.ActionItems>
      </S.Actions>
    </S.Container>
  );
};

export default NewRecentProjectsPane;
