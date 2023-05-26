import {useRef, useState} from 'react';

import {Modal, Tooltip} from 'antd';

import {DeleteOutlined, ExclamationCircleOutlined, PushpinFilled, PushpinOutlined} from '@ant-design/icons';

import {TOOLTIP_DELAY} from '@constants/constants';

import {toggleProjectPin} from '@redux/appConfig';
import {useAppDispatch} from '@redux/hooks';
import {setShowOpenProjectAlert, toggleStartProjectPane} from '@redux/reducers/ui';
import {stopClusterConnection} from '@redux/thunks/cluster';
import {setDeleteProject, setOpenProject} from '@redux/thunks/project';

import {useRefSelector} from '@utils/hooks';
import {getRelativeDate} from '@utils/index';

import {Project} from '@shared/models/config';
import {trackEvent} from '@shared/utils';
import {isInClusterModeSelector} from '@shared/utils/selectors';
import {Colors} from '@shared/styles/colors';

import * as S from './ProjectCard.styled';

type IProps = {isActive: boolean; project: Project; query?: string};

export const ProjectCard: React.FC<IProps> = props => {
  const {isActive, project, query} = props;

  const highlightQuery = (text: string) => {
    if (!query?.trim()) {
      return <span>{text}</span>;
    }
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <S.Span>
        {parts.map(part =>
          part.toLowerCase() === query.toLowerCase() ? (
            <S.BoldSpan style={{backgroundColor: `${Colors.geekblue9}`}}>{part}</S.BoldSpan>
          ) : (
            part
          )
        )}
      </S.Span>
    );
  };

  const dispatch = useAppDispatch();
  const showOpenProjectAlertRef = useRefSelector(state => state.ui.showOpenProjectAlert);
  const isInClusterModeRef = useRefSelector(isInClusterModeSelector);

  const [isTooltipMessageVisible, setIsTooltipMessageVisible] = useState(false);
  const checkboxValueRef = useRef(false);

  const handleOnDelete = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    e.stopPropagation();

    const title = `Do you want to remove ${project.name}?`;

    Modal.confirm({
      title,
      icon: <ExclamationCircleOutlined />,
      centered: true,
      zIndex: 9999,
      onOk() {
        return new Promise(resolve => {
          dispatch(setDeleteProject(project));
          trackEvent('project_list/delete_project');
          resolve({});
        });
      },
    });
  };

  const handleOnPinChange = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsTooltipMessageVisible(false);

    setTimeout(() => {
      trackEvent(project.isPinned ? 'project_list/unpin_project' : 'project_list/pin_project');
      dispatch(toggleProjectPin(project));
    }, 200);
  };

  const handleOnProjectClick = () => {
    if (isActive) {
      dispatch(toggleStartProjectPane());
      return;
    }

    if (isInClusterModeRef.current) {
      if (showOpenProjectAlertRef.current) {
        Modal.confirm({
          title: (
            <div>
              Opening this project will close the cluster connection. Do you want to continue?
              <S.Checkbox
                onChange={e => {
                  checkboxValueRef.current = e.target.checked;
                }}
              >
                Don&lsquo;t show this again
              </S.Checkbox>
            </div>
          ),
          zIndex: 9999,
          onOk: () => {
            if (checkboxValueRef.current) {
              dispatch(setShowOpenProjectAlert(false));
            }

            dispatch(stopClusterConnection());
            setImmediate(() => {
              dispatch(setOpenProject(project.rootFolder));
              trackEvent('project_list/open_project');
            });
          },
        });

        return;
      }
      dispatch(stopClusterConnection());
    }

    dispatch(setOpenProject(project.rootFolder));
  };

  return (
    <S.ProjectCardContainer $isActive={isActive} onClick={handleOnProjectClick}>
      <S.ActionsContainer>
        <DeleteOutlined onClick={handleOnDelete} />

        <Tooltip
          mouseEnterDelay={TOOLTIP_DELAY}
          open={isTooltipMessageVisible}
          onOpenChange={() => setIsTooltipMessageVisible(!isTooltipMessageVisible)}
          title={project.isPinned ? 'Unpin this project from the top' : 'Pin this project to the top'}
        >
          {project.isPinned ? (
            <PushpinFilled onClick={handleOnPinChange} />
          ) : (
            <PushpinOutlined onClick={handleOnPinChange} />
          )}
        </Tooltip>
      </S.ActionsContainer>

      <S.Name>{project.name && highlightQuery(project.name)}</S.Name>

      <S.ProjectInfo>
        <S.Type>{project.isGitRepo ? 'Git' : 'Local'}</S.Type>
        <S.Path>{project.rootFolder}</S.Path>
      </S.ProjectInfo>

      <S.LastOpened>
        {getRelativeDate(project.lastOpened) ? `last opened ${getRelativeDate(project.lastOpened)}` : 'Not opened yet'}
      </S.LastOpened>
    </S.ProjectCardContainer>
  );
};

export default ProjectCard;
