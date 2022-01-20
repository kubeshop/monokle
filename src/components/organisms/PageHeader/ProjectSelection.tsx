import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {Tooltip} from 'antd';
import Column from 'antd/lib/table/Column';

import {DownOutlined} from '@ant-design/icons';

import _ from 'lodash';
import {DateTime} from 'luxon';

import {TOOLTIP_DELAY} from '@constants/constants';
import {
  NewEmptyProjectTooltip,
  NewProjectFromFolderTooltip,
  NewProjectFromTemplateTooltip,
  ProjectManagementTooltip,
  SearchProjectTooltip,
} from '@constants/tooltips';

import {Project} from '@models/appconfig';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setCreateProject, setDeleteProject, setOpenProject} from '@redux/reducers/appConfig';
import {openCreateProjectModal} from '@redux/reducers/ui';
import {activeProjectSelector, settingsSelector} from '@redux/selectors';

import FileExplorer from '@components/atoms/FileExplorer';

import {useFileExplorer} from '@hooks/useFileExplorer';

import * as S from './Styled';

const ProjectSelection = () => {
  const dispatch = useAppDispatch();

  const projects: Project[] = useAppSelector(state => state.config.projects);
  const activeProject = useSelector(activeProjectSelector);
  const {isClusterSelectorVisible} = useAppSelector(settingsSelector);
  const [isDropdownMenuVisible, setIsDropdownMenuVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

  const {openFileExplorer, fileExplorerProps} = useFileExplorer(
    ({folderPath}) => {
      if (folderPath) {
        dispatch(setCreateProject({rootFolder: folderPath}));
      }
    },
    {isDirectoryExplorer: true}
  );

  useEffect(() => {
    if (searchText) {
      setFilteredProjects(
        _.filter(
          projects,
          (p: Project) =>
            _.includes(p.name?.toLowerCase(), searchText.toLowerCase()) ||
            _.includes(p.rootFolder.toLowerCase(), searchText.toLowerCase())
        )
      );
    }
  }, [searchText, projects]);

  const handleProjectSearch = (e: any) => {
    setSearchText(e.target.value);
  };

  const handleProjectChange = (project: Project) => {
    setIsDropdownMenuVisible(false);
    setTimeout(() => dispatch(setOpenProject(project.rootFolder)), 400);
  };

  const handleCreateProject = (fromTemplate: boolean) => {
    setIsDropdownMenuVisible(false);
    dispatch(openCreateProjectModal({fromTemplate}));
  };

  const handleDeleteProject = (project: Project) => {
    dispatch(setDeleteProject(project));
  };

  // const handleCopyProject = (project: Project) => {
  //   setIsDropdownMenuVisible(false);
  // };

  // const handleEditProject = (project: Project) => {
  //   setIsDropdownMenuVisible(false);
  // };

  const getRelativeDate = (isoDate: string | undefined) => {
    if (isoDate) {
      return DateTime.fromISO(isoDate).toRelative();
    }
    return '';
  };

  const projectMenu = () => {
    return (
      <S.ProjectMenu>
        <S.ProjectsMenuContainer>
          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={SearchProjectTooltip} placement="bottomRight">
            <S.Search placeholder="Search" value={searchText} onChange={handleProjectSearch} />
          </Tooltip>
          <S.ProjectsMenuActionsContainer>
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={NewProjectFromFolderTooltip} placement="bottomRight">
              <S.ProjectFolderOpenOutlined
                onClick={() => {
                  setIsDropdownMenuVisible(false);
                  openFileExplorer();
                }}
              />
            </Tooltip>
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={NewEmptyProjectTooltip} placement="bottomRight">
              <S.ProjectFolderAddOutlined onClick={() => handleCreateProject(false)} />
            </Tooltip>
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={NewProjectFromTemplateTooltip} placement="bottomRight">
              <S.ProjectFormatPainterOutlined onClick={() => handleCreateProject(true)} />
            </Tooltip>
          </S.ProjectsMenuActionsContainer>
        </S.ProjectsMenuContainer>
        <S.ProjectsTable
          size="small"
          showSorterTooltip={false}
          dataSource={searchText ? filteredProjects : projects}
          pagination={false}
          scroll={{y: 300}}
          rowKey="rootFolder"
          onRow={(project: Project) => ({
            onClick: () => handleProjectChange(project),
          })}
        >
          <Column
            className="projects-table-column-name"
            title="All Projects"
            dataIndex="name"
            key="name"
            sorter={(a: Project, b: Project) =>
              a.name && b.name ? b.name.toLowerCase().localeCompare(a.name.toLowerCase()) : 0
            }
            width={4}
            ellipsis
          />
          <Column
            className="projects-table-column-folder"
            title="Local Path"
            dataIndex="rootFolder"
            key="rootFolder"
            sorter={(a: Project, b: Project) => b.rootFolder.localeCompare(a.rootFolder)}
            width={6}
            ellipsis
          />
          <Column
            className="projects-table-column-created"
            title="Created"
            dataIndex="created"
            key="created"
            sorter={(a: Project, b: Project) =>
              (b.created ? new Date(b.created).getTime() : 0) - (a.created ? new Date(a.created).getTime() : 0)
            }
            width={2}
            ellipsis
            render={(value: string) => (value ? getRelativeDate(value) : '-')}
          />
          <Column
            className="projects-table-column-last-opened"
            title="Last Opened"
            dataIndex="lastOpened"
            key="lastOpened"
            sorter={(a: Project, b: Project) =>
              (b.lastOpened ? new Date(b.lastOpened).getTime() : 0) -
              (a.lastOpened ? new Date(a.lastOpened).getTime() : 0)
            }
            width={2}
            ellipsis
            render={(value: string) => (value ? getRelativeDate(value) : '-')}
          />
          <Column
            className="projects-table-column-actions"
            dataIndex="lastOpened"
            key="lastOpened"
            width={1}
            render={(value: any, project: Project) => (
              <S.ProjectTableActions>
                {/* <S.CopyOutlined
                  onClick={(e: any) => {
                    e.stopPropagation();
                    handleCopyProject(project);
                  }}
                />
                <S.EditOutlined
                  onClick={(e: any) => {
                    e.stopPropagation();
                    handleEditProject(project);
                  }}
                /> */}
                <S.DeleteOutlined
                  onClick={(e: any) => {
                    e.stopPropagation();
                    handleDeleteProject(project);
                  }}
                />
              </S.ProjectTableActions>
            )}
          />
        </S.ProjectsTable>
      </S.ProjectMenu>
    );
  };

  return (
    <S.ProjectsDropdown
      isClusterSelectorVisible={isClusterSelectorVisible}
      overlay={projectMenu}
      placement="bottomCenter"
      arrow
      trigger={['click']}
      onVisibleChange={setIsDropdownMenuVisible}
      visible={isDropdownMenuVisible}
    >
      <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={ProjectManagementTooltip} placement="bottomRight">
        <S.ProjectButton>
          <S.FolderOpenOutlined />
          <span>{activeProject?.name}</span>
          <DownOutlined style={{margin: 4}} />
          <FileExplorer {...fileExplorerProps} />
        </S.ProjectButton>
      </Tooltip>
    </S.ProjectsDropdown>
  );
};

export default ProjectSelection;
