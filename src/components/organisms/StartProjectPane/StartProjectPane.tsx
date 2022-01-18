import React from 'react';

import {Row} from 'antd';

import {FolderAddOutlined, FolderOpenOutlined, FormatPainterOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {useAppDispatch} from '@redux/hooks';
import {setCreateProject} from '@redux/reducers/appConfig';
import {openCreateProjectModal} from '@redux/reducers/ui';

import {MonoPaneTitle, MonoPaneTitleCol} from '@atoms';
import FileExplorer from '@atoms/FileExplorer';

import {useFileExplorer} from '@hooks/useFileExplorer';

import Colors from '@styles/Colors';

const TitleBarContainer = styled.div`
  display: flex;
  height: 24px;
  justify-content: space-between;
`;

const Title = styled.span`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  padding-right: 10px;
`;

const StyledFolderOpenOutlined = styled(FolderOpenOutlined)`
  font-size: 56px;
  color: ${Colors.blue10};
  margin-bottom: 24px;
`;

const StyledFolderAddOutlined = styled(FolderAddOutlined)`
  font-size: 56px;
  color: ${Colors.blue10};
  margin-bottom: 24px;
`;

const StyledFormatPainterOutlined = styled(FormatPainterOutlined)`
  font-size: 56px;
  color: ${Colors.blue10};
  margin-bottom: 24px;
`;

const StyledActionContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 40px;
  cursor: pointer;
`;

const StyledActionText = styled.div`
  color: ${Colors.blue6};
  font-size: 12px;
`;

const StyledActionTitle = styled.div`
  font-size: 22px;
  text-align: center;
  margin-bottom: 150px;
`;

const StyledContainer = styled.div`
  width: 100%;
  height: calc(100vh - 112px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 150px;
`;

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
