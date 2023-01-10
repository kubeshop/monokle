import {useState} from 'react';

import {Modal, Tooltip} from 'antd';

import {DeleteOutlined, ExclamationCircleOutlined, PushpinFilled, PushpinOutlined} from '@ant-design/icons';

import {TOOLTIP_DELAY} from '@constants/constants';

import {useAppDispatch} from '@redux/hooks';
import {setDeleteProject, setOpenProject, toggleProjectPin} from '@redux/reducers/appConfig';
import {toggleStartProjectPane} from '@redux/reducers/ui';

import {getRelativeDate} from '@utils/index';

import {Project} from '@shared/models/config';

import * as S from './ProjectCard.styled';

type IProps = {isActive: boolean; project: Project};

export const ProjectCard: React.FC<IProps> = props => {
  const {isActive, project} = props;

  const dispatch = useAppDispatch();

  const [isTooltipMessageVisible, setIsTooltipMessageVisible] = useState(false);

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
      dispatch(toggleProjectPin(project));
    }, 200);
  };

  const handleOnProjectClick = () => {
    if (isActive) {
      dispatch(toggleStartProjectPane());
      return;
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

      <S.Name>{project.name}</S.Name>

      <S.Path>{project.rootFolder}</S.Path>

      <S.LastOpened>
        {getRelativeDate(project.lastOpened) ? `last opened ${getRelativeDate(project.lastOpened)}` : 'Not opened yet'}
      </S.LastOpened>
    </S.ProjectCardContainer>
  );
};

export default ProjectCard;
