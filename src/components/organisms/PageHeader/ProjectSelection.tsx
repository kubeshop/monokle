import {ipcRenderer} from 'electron';

import {useEffect, useRef, useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';

import {Dropdown, Modal, Tooltip} from 'antd';
import Column from 'antd/lib/table/Column';

import {ExclamationCircleOutlined} from '@ant-design/icons';

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
import {openCreateProjectModal, toggleStartProjectPane} from '@redux/reducers/ui';
import {activeProjectSelector, isInPreviewModeSelector, unsavedResourcesSelector} from '@redux/selectors';

import FileExplorer from '@components/atoms/FileExplorer';
import WalkThrough from '@components/molecules/WalkThrough';

import {useFileExplorer} from '@hooks/useFileExplorer';

import * as S from './ProjectSelection.styled';

const ProjectSelection = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const isStartProjectPaneVisible = useAppSelector(state => state.ui.isStartProjectPaneVisible);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const projects: Project[] = useAppSelector(state => state.config.projects);
  const unsavedResourceCount = useAppSelector(unsavedResourcesSelector).length;

  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isDropdownMenuVisible, setIsDropdownMenuVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const deleteModalVisible = useRef({visible: false});
  const dropdownButtonRef = useRef<HTMLButtonElement | null>(null);

  const {openFileExplorer, fileExplorerProps} = useFileExplorer(
    ({folderPath}) => {
      if (folderPath) {
        dispatch(setCreateProject({rootFolder: folderPath}));
      }
    },
    {isDirectoryExplorer: true}
  );

  useHotkeys('escape', () => {
    setIsDropdownMenuVisible(false);
    dropdownButtonRef.current?.blur();
  });

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
    if (activeProject?.rootFolder !== project.rootFolder) {
      const confirmed = ipcRenderer.sendSync('confirm-action', {
        unsavedResourceCount,
        action: 'change the active project',
      });

      if (!confirmed) {
        return;
      }

      setTimeout(() => dispatch(setOpenProject(project.rootFolder)), 400);
    }
  };

  const handleCreateProject = (fromTemplate: boolean) => {
    setIsDropdownMenuVisible(false);
    dispatch(openCreateProjectModal({fromTemplate}));
  };

  const handleDeleteProject = (project: Project) => {
    const title = `Do you want to remove ${project?.name}?`;
    deleteModalVisible.current.visible = true;
    Modal.confirm({
      title,
      icon: <ExclamationCircleOutlined />,
      centered: true,
      zIndex: 9999,
      onOk() {
        return new Promise(resolve => {
          if (activeProject?.rootFolder === project.rootFolder) {
            setIsDropdownMenuVisible(false);
          }

          dispatch(setDeleteProject(project));
          resolve({});
          deleteModalVisible.current.visible = false;
        });
      },
      onCancel() {
        deleteModalVisible.current.visible = false;
      },
    });
  };

  const onDropdownVisibleChange = (visible: boolean) => {
    if (!deleteModalVisible.current.visible) {
      setIsDropdownMenuVisible(visible);
    }
  };

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
            <S.Search id="project-search" placeholder="Search" value={searchText} onChange={handleProjectSearch} />
          </Tooltip>
          <S.ProjectsMenuActionsContainer>
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={NewProjectFromFolderTooltip} placement="bottomRight">
              <S.ProjectFolderOpenOutlined
                id="open-new-project"
                onClick={() => {
                  setIsDropdownMenuVisible(false);
                  openFileExplorer();
                }}
              />
            </Tooltip>
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={NewEmptyProjectTooltip} placement="bottomRight">
              <S.FolderAddOutlined onClick={() => handleCreateProject(false)} />
            </Tooltip>
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={NewProjectFromTemplateTooltip} placement="bottomRight">
              <S.FormatPainterOutlined onClick={() => handleCreateProject(true)} />
            </Tooltip>
          </S.ProjectsMenuActionsContainer>
        </S.ProjectsMenuContainer>

        <S.Table
          size="small"
          showSorterTooltip={false}
          dataSource={searchText ? filteredProjects : projects}
          pagination={false}
          scroll={{y: 300}}
          rowKey="rootFolder"
          onRow={(project: Project) => ({
            onClick: () => handleProjectChange(project),
          })}
          rowClassName={(project: Project) => {
            if (activeProject?.rootFolder === project?.rootFolder) {
              return 'table-active-row';
            }

            return '';
          }}
        >
          <Column
            className="table-column-name projects-table-column-name"
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
            className="table-column-actions"
            key="projectActions"
            width={1}
            render={(value: any, project: Project) => (
              <S.ProjectTableActions>
                <S.DeleteOutlined
                  onClick={(e: any) => {
                    e.stopPropagation();
                    handleDeleteProject(project);
                  }}
                />
              </S.ProjectTableActions>
            )}
          />
        </S.Table>
      </S.ProjectMenu>
    );
  };

  if (!activeProject) {
    return null;
  }

  return (
    <S.ProjectContainer id="projects-dropdown-container">
      <WalkThrough placement="leftTop" step="template" collection="novice">
        <Dropdown
          arrow
          disabled={previewLoader.isLoading || isInPreviewMode}
          overlay={projectMenu}
          placement="bottom"
          trigger={['click']}
          visible={isDropdownMenuVisible}
          onVisibleChange={onDropdownVisibleChange}
        >
          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} placement="bottomRight" title={ProjectManagementTooltip}>
            <S.Button ref={dropdownButtonRef} disabled={previewLoader.isLoading || isInPreviewMode} type="link">
              <S.FolderOpenOutlined />
              <S.ProjectName>{activeProject.name}</S.ProjectName>
              <S.DownOutlined />
            </S.Button>
          </Tooltip>
        </Dropdown>
      </WalkThrough>

      {isStartProjectPaneVisible && activeProject && (
        <>
          <S.Divider type="vertical" />
          <S.BackToProjectButton type="link" onClick={() => dispatch(toggleStartProjectPane())}>
            Back to Project
          </S.BackToProjectButton>
        </>
      )}
      <FileExplorer {...fileExplorerProps} />
    </S.ProjectContainer>
  );
};

export default ProjectSelection;
