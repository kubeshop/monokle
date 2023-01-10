import {useAppSelector} from '@redux/hooks';
import {sortProjects} from '@redux/reducers/appConfig';

import {ProjectCard} from '@components/molecules_new';

import {activeProjectSelector} from '@shared/utils/selectors';

import * as S from './ProjectsList.styled';

type IProps = {
  type: 'all' | 'recent';
};

const ProjectsList: React.FC<IProps> = props => {
  const {type} = props;

  const activeProject = useAppSelector(activeProjectSelector);
  const currentProjects = useAppSelector(state => {
    let projects = sortProjects(state.config.projects, Boolean(activeProject));

    if (type === 'recent') {
      projects = projects.slice(0, 5);
    }

    return projects;
  });

  return (
    <S.ProjectsListContainer>
      {currentProjects.map(project => (
        <ProjectCard
          key={project.rootFolder}
          isActive={project.rootFolder === activeProject?.rootFolder}
          project={project}
        />
      ))}
    </S.ProjectsListContainer>
  );
};

export default ProjectsList;
