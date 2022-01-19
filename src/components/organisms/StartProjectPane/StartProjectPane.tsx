import React from 'react';

import {Row} from 'antd';

import {useAppDispatch} from '@redux/hooks';
import {setCreateProject} from '@redux/reducers/appConfig';
import {openCreateProjectModal} from '@redux/reducers/ui';

import {MonoPaneTitle, MonoPaneTitleCol} from '@atoms';
import FileExplorer from '@atoms/FileExplorer';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {
  StyledActionContainer,
  StyledActionText,
  StyledActionTitle,
  StyledContainer,
  StyledFolderAddOutlined,
  StyledFolderOpenOutlined,
  StyledFormatPainterOutlined,
  Title,
  TitleBarContainer,
} from './Styled';

const StartProjectPane = () => {
  const dispatch = useAppDispatch();

  const {openFileExplorer, fileExplorerProps} = useFileExplorer(
    ({folderPath}) => {
      if (folderPath) {
        dispatch(setCreateProject({rootFolder: folderPath}));
      }
    },
    {isDirectoryExplorer: true}
  );

  const handleCreateProject = (fromTemplate: boolean) => {
    dispatch(openCreateProjectModal({fromTemplate}));
  };

  return (
    <>
      <Row>
        <MonoPaneTitleCol>
          <MonoPaneTitle>
            <TitleBarContainer>
              <Title>Start a Project</Title>
            </TitleBarContainer>
          </MonoPaneTitle>
        </MonoPaneTitleCol>
      </Row>
      <Row>
        <StyledContainer>
          <div>
            <StyledActionTitle>How would you like to begin?</StyledActionTitle>
            <div style={{display: 'flex'}}>
              <StyledActionContainer onClick={openFileExplorer}>
                <StyledFolderOpenOutlined />
                <StyledActionText>Select an existing folder</StyledActionText>
              </StyledActionContainer>
              <StyledActionContainer onClick={() => handleCreateProject(false)}>
                <StyledFolderAddOutlined />
                <StyledActionText>Create an empty project</StyledActionText>
              </StyledActionContainer>
              <StyledActionContainer onClick={() => handleCreateProject(true)}>
                <StyledFormatPainterOutlined />
                <StyledActionText>Start from a template</StyledActionText>
              </StyledActionContainer>
            </div>
          </div>
        </StyledContainer>
      </Row>
      <FileExplorer {...fileExplorerProps} />
    </>
  );
};

export default StartProjectPane;
