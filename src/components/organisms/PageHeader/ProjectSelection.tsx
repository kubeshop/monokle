import React, {useState} from 'react';
import {useSelector} from 'react-redux';

import {Table} from 'antd';
import Column from 'antd/lib/table/Column';

import {DownOutlined} from '@ant-design/icons';

import {DateTime} from 'luxon';

import {Project} from '@models/appconfig';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setOpenProject} from '@redux/reducers/appConfig';
import {activeProjectSelector, settingsSelector} from '@redux/selectors';

import {
  StyledCopyOutlined,
  StyledDeleteOutlined,
  StyledEditOutlined,
  StyledFolderOpenOutlined,
  StyledProjectButton,
  StyledProjectMenu,
  StyledProjectTableActions,
  StyledProjectsDropdown,
} from './Styled';

const ProjectSelection = () => {
  const dispatch = useAppDispatch();

  const projects: Project[] = useAppSelector(state => state.config.projects);
  const activeProject = useSelector(activeProjectSelector);
  const {isClusterSelectorVisible} = useAppSelector(settingsSelector);
  const [isDropdownMenuVisible, setIsDropdownMenuVisible] = useState(false);

  const handleProjectChange = (project: Project) => {
    setIsDropdownMenuVisible(false);
    setTimeout(() => dispatch(setOpenProject(project.rootFolder)), 400);
  };

  const handleDeleteProject = (project: Project) => {
    setIsDropdownMenuVisible(false);
  };

  const handleCopyProject = (project: Project) => {
    setIsDropdownMenuVisible(false);
  };

  const handleEditProject = (project: Project) => {
    setIsDropdownMenuVisible(false);
  };

  const getRelativeDate = (isoDate: string | undefined) => {
    if (isoDate) {
      return DateTime.fromISO(isoDate).toRelative();
    }
    return '';
  };

  const projectMenu = () => {
    return (
      <StyledProjectMenu>
        <Table
          size="small"
          style={{width: '800px', marginTop: '100px', borderTop: '1px solid #262626'}}
          showSorterTooltip={false}
          dataSource={projects}
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
            width={2}
            ellipsis
          />
          <Column
            className="projects-table-column-folder"
            title="Local Path"
            dataIndex="rootFolder"
            key="rootFolder"
            sorter={(a: Project, b: Project) => b.rootFolder.localeCompare(a.rootFolder)}
            width={3}
            ellipsis
          />
          <Column
            className="projects-table-column-created"
            title="Created"
            dataIndex="lastOpened"
            key="lastOpened"
            sorter={(a: Project, b: Project) =>
              (b.lastOpened ? new Date(b.lastOpened).getTime() : 0) -
              (a.lastOpened ? new Date(a.lastOpened).getTime() : 0)
            }
            width={1}
            ellipsis
            render={getRelativeDate}
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
            width={1}
            ellipsis
            render={getRelativeDate}
          />
          <Column
            className="projects-table-column-actions"
            dataIndex="lastOpened"
            key="lastOpened"
            width={1}
            render={(_, project: Project) => (
              <StyledProjectTableActions>
                <StyledCopyOutlined
                  onClick={(e: any) => {
                    e.stopPropagation();
                    handleCopyProject(project);
                  }}
                />
                <StyledEditOutlined
                  onClick={(e: any) => {
                    e.stopPropagation();
                    handleEditProject(project);
                  }}
                />
                <StyledDeleteOutlined
                  onClick={(e: any) => {
                    e.stopPropagation();
                    handleDeleteProject(project);
                  }}
                />
              </StyledProjectTableActions>
            )}
          />
        </Table>
      </StyledProjectMenu>
    );
  };

  return (
    <StyledProjectsDropdown
      isClusterSelectorVisible={isClusterSelectorVisible}
      overlay={projectMenu}
      placement="bottomCenter"
      arrow
      trigger={['click']}
      onVisibleChange={setIsDropdownMenuVisible}
      visible={isDropdownMenuVisible}
    >
      <StyledProjectButton>
        <StyledFolderOpenOutlined />
        <span>{activeProject?.name}</span>
        <DownOutlined style={{margin: 4}} />
      </StyledProjectButton>
    </StyledProjectsDropdown>
  );
};

export default ProjectSelection;
