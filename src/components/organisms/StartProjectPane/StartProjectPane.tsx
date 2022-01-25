import React from 'react';

import {Row} from 'antd';

import {useAppDispatch} from '@redux/hooks';
import {openCreateProjectModal, openFolderExplorer} from '@redux/reducers/ui';

import {MonoPaneTitle, MonoPaneTitleCol} from '@atoms';

import SelectAnEmptyProject from '@assets/SelectAnEmptyProject.svg';
import SelectAnExistingFolder from '@assets/SelectAnExistingFolder.svg';
import StartFromTemplate from '@assets/StartFromTemplate.svg';

import * as S from './Styled';

const StartProjectPane = () => {
  const dispatch = useAppDispatch();

  const handleOpenFolderExplorer = () => {
    dispatch(openFolderExplorer());
  };

  const handleCreateProject = (fromTemplate: boolean) => {
    dispatch(openCreateProjectModal({fromTemplate}));
  };

  return (
    <>
      <Row>
        <MonoPaneTitleCol>
          <MonoPaneTitle>
            <S.TitleBarContainer>
              <S.Title>Start a Project</S.Title>
            </S.TitleBarContainer>
          </MonoPaneTitle>
        </MonoPaneTitleCol>
      </Row>
      <Row>
        <S.Container>
          <div>
            <S.ActionTitle>How would you like to begin?</S.ActionTitle>
            <div style={{display: 'flex'}}>
              <S.ActionContainer onClick={handleOpenFolderExplorer}>
                <S.IconWrapper>
                  <S.FolderOpenOutlined src={SelectAnExistingFolder} />
                </S.IconWrapper>
                <S.ActionText>Select an existing folder</S.ActionText>
              </S.ActionContainer>
              <S.ActionContainer onClick={() => handleCreateProject(false)}>
                <S.IconWrapper>
                  <S.FolderAddOutlined src={SelectAnEmptyProject} />
                </S.IconWrapper>
                <S.ActionText>Create an empty project</S.ActionText>
              </S.ActionContainer>
              <S.ActionContainer onClick={() => handleCreateProject(true)}>
                <S.IconWrapper>
                  <S.FormatPainterOutlined src={StartFromTemplate} />
                </S.IconWrapper>
                <S.ActionText>Start from a template</S.ActionText>
              </S.ActionContainer>
            </div>
          </div>
        </S.Container>
      </Row>
    </>
  );
};

export default StartProjectPane;
