import React, {FC} from 'react';

import Tooltip from 'antd/lib/tooltip';

import {PushpinFilled, PushpinOutlined} from '@ant-design/icons';

import {DateTime} from 'luxon';

import {Project} from '@models/appconfig';

import * as S from './RecentProject.styled';

interface RecentProjectType {
  project: Project;
  isActive: boolean;
  onProjectItemClick?: Function;
  onPinChanged?: Function;
}

const getRelativeDate = (isoDate: string | undefined) => {
  if (isoDate) {
    return DateTime.fromISO(isoDate).toRelative();
  }
  return '';
};

const RecentProject: FC<RecentProjectType> = ({project, isActive, onProjectItemClick, onPinChanged}) => {
  const handleOnProjectItemClick = () => {
    if (onProjectItemClick) {
      onProjectItemClick(isActive, project);
    }
  };

  const handleOnPinChanged = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (onPinChanged) {
      onPinChanged(!project.isPinned);
    }
  };

  return (
    <S.ProjectItem key={project.rootFolder} activeproject={isActive} onClick={handleOnProjectItemClick}>
      {project.isPinned ? (
        <Tooltip placement="top" title="Unpin this project from the top">
          <PushpinFilled onClick={handleOnPinChanged} />
        </Tooltip>
      ) : (
        <Tooltip placement="top" title="Pin this project to the top">
          <PushpinOutlined onClick={handleOnPinChanged} />
        </Tooltip>
      )}
      <S.ProjectName>{project.name}</S.ProjectName>
      <Tooltip title={project.rootFolder} placement="bottom">
        <S.ProjectPath>{project.rootFolder}</S.ProjectPath>
      </Tooltip>
      <S.ProjectLastOpened>
        {getRelativeDate(project.lastOpened) ? `last opened ${getRelativeDate(project.lastOpened)}` : 'Not opened yet'}
      </S.ProjectLastOpened>
    </S.ProjectItem>
  );
};

export default RecentProject;
