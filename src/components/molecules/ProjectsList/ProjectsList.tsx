import {useMemo, useState} from 'react';

import {Select} from 'antd';

import {PlusOutlined} from '@ant-design/icons';

import {orderBy, size} from 'lodash';

import {activeProjectSelector, sortProjects} from '@redux/appConfig';
import {useAppSelector} from '@redux/hooks';

import ProjectCard from '../ProjectCard';
import * as S from './ProjectsList.styled';

type IProps = {
  type: 'all' | 'recent';
};

type FiltersType = 'all' | 'local' | 'git';
type CreationFiltersType = 'last-created' | 'first-created' | 'name-asc' | 'name-desc' | 'last-opened';

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

    let projects = orderBy(
      currentProjects,
      creationFilter === 'last-created' || creationFilter === 'first-created'
        ? 'created'
        : creationFilter === 'name-asc' || creationFilter === 'name-desc'
        ? project => (project.name ? project.name.toLowerCase() : project.rootFolder)
        : 'lastOpened',

      creationFilter === 'last-created' || creationFilter === 'name-desc' || creationFilter === 'last-opened'
        ? 'desc'
        : 'asc'
    );

    if (typeFilter === 'all') {
      return projects;
    }

    if (typeFilter === 'git') {
      return projects.filter(p => p.isGitRepo);
    }

    return projects.filter(p => !p.isGitRepo);
  }, [creationFilter, currentProjects, type, typeFilter]);

  if (size(filteredAndSortedProjects) === 0) {
    return (
      <S.EmptyList>
        Click on
        <div style={{marginTop: '2px'}}>
          <S.NewProjectIcon $size="small">
            <PlusOutlined />
          </S.NewProjectIcon>
          <b>New project</b>
        </div>
        on the left menu to create a project.
      </S.EmptyList>
    );
  }

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
            <Select.Option key="name-asc" value="name-asc">
              Sort by name A-Z
            </Select.Option>
            <Select.Option key="name-desc" value="name-desc">
              Sort by name Z-A
            </Select.Option>
            <Select.Option key="last-opened" value="last-opened">
              Sort by last opened
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
