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
  onPinChange?: Function;
}

const getRelativeDate = (isoDate: string | undefined) => {
  if (isoDate) {
    return DateTime.fromISO(isoDate).toRelative();
  }
  return '';
};

const RecentProject: FC<RecentProjectType> = ({project, isActive, onProjectItemClick, onPinChange}) => {
  const handleOnProjectItemClick = () => {
    if (onProjectItemClick) {
      onProjectItemClick(isActive, project);
    }
  };

  const handleOnPinChange = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (onPinChange) {
      onPinChange(!project.isPinned);
    }
  };

  return (
    <S.Container key={project.rootFolder} activeproject={isActive} onClick={handleOnProjectItemClick}>
      {project.isPinned ? (
        <Tooltip placement="top" title="Unpin this project from the top">
          <PushpinFilled onClick={handleOnPinChange} />
        </Tooltip>
      ) : (
        <Tooltip placement="top" title="Pin this project to the top">
          <PushpinOutlined onClick={handleOnPinChange} />
        </Tooltip>
      )}
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
