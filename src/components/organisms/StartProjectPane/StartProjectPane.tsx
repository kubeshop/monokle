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
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
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

  const handleCreateProject = () => {
    dispatch(openCreateProjectModal());
  };

  return (
    <div style={{height: '100%'}}>
      <Row style={{height: '100%'}}>
        <MonoPaneTitleCol>
          <MonoPaneTitle>
            <TitleBarContainer>
              <Title>Start a Project</Title>
            </TitleBarContainer>
          </MonoPaneTitle>
        </MonoPaneTitleCol>
        <StyledContainer>
          <div style={{height: '500px'}}>
            <StyledActionTitle>How would you like to begin?</StyledActionTitle>
            <div style={{display: 'flex'}}>
              <StyledActionContainer onClick={openFileExplorer}>
                <StyledFolderOpenOutlined />
                <StyledActionText>Select an existing folder</StyledActionText>
              </StyledActionContainer>
              <StyledActionContainer onClick={handleCreateProject}>
                <StyledFolderAddOutlined />
                <StyledActionText>Create an empty project</StyledActionText>
              </StyledActionContainer>
              <StyledActionContainer onClick={handleCreateProject}>
                <StyledFormatPainterOutlined />
                <StyledActionText>Start from a template</StyledActionText>
              </StyledActionContainer>
            </div>
          </div>
        </StyledContainer>
        <FileExplorer {...fileExplorerProps} />
      </Row>
    </div>
  );
};

export default StartProjectPane;
