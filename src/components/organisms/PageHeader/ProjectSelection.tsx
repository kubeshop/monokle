import {ipcRenderer} from 'electron';

import {useEffect, useRef, useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';

import {Dropdown, Modal, Tooltip} from 'antd';
import Column from 'antd/lib/table/Column';

import {ExclamationCircleOutlined} from '@ant-design/icons';

import _ from 'lodash';

import {TOOLTIP_DELAY} from '@constants/constants';
import {
  InstallGitTooltip,
  NewEmptyProjectTooltip,
  NewProjectFromFolderTooltip,
  NewProjectFromGitTooltip,
  NewProjectFromTemplateTooltip,
  ProjectManagementTooltip,
  SearchProjectTooltip,
} from '@constants/tooltips';

import {Project} from '@models/appconfig';

import {openGitCloneModal} from '@redux/git';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setCreateProject, setDeleteProject, setOpenProject, updateProjectsGitRepo} from '@redux/reducers/appConfig';
import {openCreateProjectModal} from '@redux/reducers/ui';
import {activeProjectSelector, unsavedResourcesSelector} from '@redux/selectors';

import {Walkthrough} from '@molecules';

import {FileExplorer} from '@atoms';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {getRelativeDate} from '@utils';
import {promiseFromIpcRenderer} from '@utils/promises';

import * as S from './ProjectSelection.styled';

const ProjectSelection = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const gitRepo = useAppSelector(state => state.git.repo);
  const isGitInstalled = useAppSelector(state => state.git.isGitInstalled);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const projects = useAppSelector(state => state.config.projects);
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

  const handleGitProject = () => {
    setIsDropdownMenuVisible(false);
    dispatch(openGitCloneModal());
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
            <Tooltip
              mouseEnterDelay={TOOLTIP_DELAY}
              title={isGitInstalled ? NewProjectFromGitTooltip : InstallGitTooltip}
              placement="bottomRight"
            >
              <S.GitRepository
                $disabled={!isGitInstalled}
                onClick={() => {
                  if (isGitInstalled) {
                    handleGitProject();
                  }
                }}
              >
                <S.GitRepositoryIcon name="git-repository" />
              </S.GitRepository>
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
            render={(name, project) => {
              let isGitRepo = project.isGitRepo;

              return (
                <S.TableColumnName>
                  {isGitRepo ? <S.GitProjectIcon name="git-project" /> : <S.FolderOutlined />}
                  <span title={name}>{name}</span>
                </S.TableColumnName>
              );
            }}
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

  useEffect(() => {
    const foundProjects = projects.filter(p => _.isUndefined(p.isGitRepo));

    if (!foundProjects?.length) {
      return;
    }

    promiseFromIpcRenderer(
      'git.areFoldersGitRepos',
      'git.areFoldersGitRepos.result',
      foundProjects.map(p => p.rootFolder)
    ).then(result => {
      dispatch(updateProjectsGitRepo(result));
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!activeProject) {
    return null;
  }

  return (
    <S.ProjectContainer id="projects-dropdown-container">
      <Walkthrough placement="leftTop" step="template" collection="novice">
        <Dropdown
          disabled={previewLoader.isLoading}
          overlay={projectMenu}
          placement="bottomRight"
          trigger={['click']}
          open={isDropdownMenuVisible}
          onOpenChange={onDropdownVisibleChange}
        >
          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} placement="bottomRight" title={ProjectManagementTooltip}>
            <S.Button ref={dropdownButtonRef} disabled={previewLoader.isLoading} type="link" size="small">
              <S.ProjectLabel>Project</S.ProjectLabel>

              <S.ProjectContent>
                {gitRepo ? <S.GitProjectIcon name="git-project" /> : <S.FolderOutlined />}

                <S.ProjectName>{activeProject.name}</S.ProjectName>
                <S.DownOutlined />
              </S.ProjectContent>
            </S.Button>
          </Tooltip>
        </Dropdown>
      </Walkthrough>

      <FileExplorer {...fileExplorerProps} />
    </S.ProjectContainer>
  );
};

export default ProjectSelection;
