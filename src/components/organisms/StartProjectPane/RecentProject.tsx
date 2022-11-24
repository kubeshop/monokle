import {useState} from 'react';

import {Modal} from 'antd';
import Tooltip from 'antd/lib/tooltip';

import {ExclamationCircleOutlined, PushpinFilled, PushpinOutlined} from '@ant-design/icons';

import {TOOLTIP_DELAY} from '@constants/constants';

import {useAppDispatch} from '@redux/hooks';
import {setDeleteProject} from '@redux/reducers/appConfig';

import {getRelativeDate} from '@utils';

import {Project} from '@shared/models/config';

import * as S from './RecentProject.styled';

type RecentProjectProps = {
  project: Project;
  isActive: boolean;
  onProjectItemClick?: (isActive: boolean, project: Project) => void;
  onPinChange?: (isPinned: boolean) => void;
};

const RecentProject: React.FC<RecentProjectProps> = ({project, isActive, onProjectItemClick, onPinChange}) => {
  const dispatch = useAppDispatch();

  const [isTooltipMessageVisible, setIsTooltipMessageVisible] = useState(false);

  const handleOnProjectItemClick = () => {
    if (onProjectItemClick) {
      onProjectItemClick(isActive, project);
    }
  };

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
      if (onPinChange) {
        onPinChange(!project.isPinned);
      }
    }, 200);
  };

  return (
    <S.Container key={project.rootFolder} activeproject={isActive} onClick={handleOnProjectItemClick}>
      <S.ActionsContainer>
        <S.DeleteOutlined onClick={handleOnDelete} />

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
      <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={project.rootFolder} placement="bottom">
        <S.Path>{project.rootFolder}</S.Path>
      </Tooltip>
      <S.LastOpened>
        {getRelativeDate(project.lastOpened) ? `last opened ${getRelativeDate(project.lastOpened)}` : 'Not opened yet'}
      </S.LastOpened>
    </S.Container>
  );
};

export default RecentProject;
