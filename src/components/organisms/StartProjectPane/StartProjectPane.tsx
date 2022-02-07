import {useAppDispatch} from '@redux/hooks';
import {openCreateProjectModal, openFolderExplorer} from '@redux/reducers/ui';

import {TitleBar} from '@molecules';

import SelectAnEmptyProject from '@assets/SelectAnEmptyProject.svg';
import SelectAnExistingFolder from '@assets/SelectAnExistingFolder.svg';
import StartFromTemplate from '@assets/StartFromTemplate.svg';

import * as S from './styled';

const StartProjectPane = () => {
  const dispatch = useAppDispatch();

  const handleOpenFolderExplorer = () => {
    dispatch(openFolderExplorer());
  };

  const handleCreateProject = (fromTemplate: boolean) => {
    dispatch(openCreateProjectModal({fromTemplate}));
  };

  return (
    <S.StartProjectPaneContainer>
      <TitleBar title="Start a Project" />

      <S.StartBackground>
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
      </S.StartBackground>
    </S.StartProjectPaneContainer>
  );
};

export default StartProjectPane;
