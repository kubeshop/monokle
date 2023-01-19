import {useMemo, useState} from 'react';

import {Select} from 'antd';

import {orderBy} from 'lodash';

import {useAppSelector} from '@redux/hooks';
import {sortProjects} from '@redux/reducers/appConfig';

import {ProjectCard} from '@components/molecules_new';

import {activeProjectSelector} from '@shared/utils/selectors';

import * as S from './ProjectsList.styled';

type IProps = {
  type: 'all' | 'recent';
};

type FiltersType = 'all' | 'local' | 'git';
type CreationFiltersType = 'last-created' | 'first-created';

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

  const [typeFilter, setTypeFilter] = useState<FiltersType>('all');
  const [creationFilter, setCreationFilter] = useState<CreationFiltersType>('last-created');

  const filteredAndSortedProjects = useMemo(() => {
    if (type === 'recent') {
      return currentProjects;
    }

    let projects = orderBy(currentProjects, 'created', creationFilter === 'last-created' ? 'desc' : 'asc');

    if (typeFilter === 'all') {
      return projects;
    }

    if (typeFilter === 'git') {
      return projects.filter(p => p.isGitRepo);
    }

    return projects.filter(p => !p.isGitRepo);
  }, [creationFilter, currentProjects, type, typeFilter]);

  return (
    <>
      {type === 'all' && (
        <S.SortAndFiltersContainer>
          <S.Select
            dropdownMatchSelectWidth={false}
            value={typeFilter}
            onChange={value => {
              setTypeFilter(value as FiltersType);
            }}
          >
            <Select.Option key="all" value="all">
              All
            </Select.Option>
            <Select.Option key="local" value="local">
              Local
            </Select.Option>
            <Select.Option key="git" value="git">
              Git
            </Select.Option>
          </S.Select>

          <S.Select
            dropdownMatchSelectWidth={false}
            value={creationFilter}
            onChange={value => {
              setCreationFilter(value as CreationFiltersType);
            }}
          >
            <Select.Option key="last-created" value="last-created">
              Sort by last created
            </Select.Option>
            <Select.Option key="first-created" value="first-created">
              Sort by first created
            </Select.Option>
          </S.Select>
        </S.SortAndFiltersContainer>
      )}

      <S.ProjectsListContainer>
        {filteredAndSortedProjects.map(project => (
          <ProjectCard
            key={project.rootFolder}
            isActive={project.rootFolder === activeProject?.rootFolder}
            project={project}
          />
        ))}
      </S.ProjectsListContainer>
    </>
  );
};

export default ProjectsList;
