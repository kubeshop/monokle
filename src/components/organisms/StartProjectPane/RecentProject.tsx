import React, {FC, useState} from 'react';

import Tooltip from 'antd/lib/tooltip';

import {PushpinFilled, PushpinOutlined} from '@ant-design/icons';

import {DateTime} from 'luxon';

import {Project} from '@models/appconfig';

import * as S from './RecentProject.styled';

type RecentProjectProps = {
  project: Project;
  isActive: boolean;
  onProjectItemClick?: (isActive: boolean, project: Project) => void;
  onPinChange?: (isPinned: boolean) => void;
};

const getRelativeDate = (isoDate: string | undefined) => {
  if (isoDate) {
    return DateTime.fromISO(isoDate).toRelative();
  }
  return '';
};

const RecentProject: FC<RecentProjectProps> = ({project, isActive, onProjectItemClick, onPinChange}) => {
  const [isTooltipMessageVisible, setIsTooltipMessageVisible] = useState(false);

  const handleOnProjectItemClick = () => {
    if (onProjectItemClick) {
      onProjectItemClick(isActive, project);
    }
  };

  const handleOnPinChange = (e: any) => {
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
      <Tooltip
        visible={isTooltipMessageVisible}
        onVisibleChange={() => setIsTooltipMessageVisible(!isTooltipMessageVisible)}
        title={project.isPinned ? 'Unpin this project from the top' : 'Pin this project to the top'}
      >
        {project.isPinned ? (
          <PushpinFilled onClick={handleOnPinChange} />
        ) : (
          <PushpinOutlined onClick={handleOnPinChange} />
        )}
      </Tooltip>

      <S.Name>{project.name}</S.Name>
      <Tooltip title={project.rootFolder} placement="bottom">
        <S.Path>{project.rootFolder}</S.Path>
      </Tooltip>
      <S.LastOpened>
        {getRelativeDate(project.lastOpened) ? `last opened ${getRelativeDate(project.lastOpened)}` : 'Not opened yet'}
      </S.LastOpened>
    </S.Container>
  );
};

export default RecentProject;
