import {useAppSelector} from '@redux/hooks';
import {sortProjects} from '@redux/reducers/appConfig';

import {ProjectCard} from '@components/molecules_new';

import {activeProjectSelector} from '@shared/utils/selectors';

import * as S from './RecentProjects.styled';

const RecentProjects: React.FC = () => {
  const activeProject = useAppSelector(activeProjectSelector);
  const projects = useAppSelector(state => state.config.projects);

  return (
    <S.RecentProjectsContainer>
      {sortProjects(projects, Boolean(activeProject))
        .slice(0, 5)
        .map(project => (
          <ProjectCard
            key={project.rootFolder}
            isActive={project.rootFolder === activeProject?.rootFolder}
            project={project}
          />
        ))}
    </S.RecentProjectsContainer>
  );
};

export default RecentProjects;
