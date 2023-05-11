import {shell} from 'electron';

import {toggleEditorPlaceholderVisiblity} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setExplorerSelectedSection, setLeftMenuSelection} from '@redux/reducers/ui';

import MonacoPlaceholderImage from '@assets/MonacoPlaceholderImage.svg';

import {isInClusterModeSelector} from '@shared/utils/selectors';

import * as S from './MonacoPlaceholder.styled';

export const MonacoPlaceholder: React.FC = () => {
  const isInClusterMode = useAppSelector(isInClusterModeSelector);

  const dispatch = useAppDispatch();

  const handleDashboard = () => {
    dispatch(setLeftMenuSelection('dashboard'));
  };

  const handleValidation = () => {
    dispatch(setLeftMenuSelection('validation'));
  };

  const handleHelmCharts = () => {
    dispatch(setLeftMenuSelection('explorer'));
    dispatch(setExplorerSelectedSection('helm'));
  };

  const handleKustomization = () => {
    dispatch(setLeftMenuSelection('explorer'));
    dispatch(setExplorerSelectedSection('kustomize'));
  };

  const handleGitOperations = () => {
    dispatch(setLeftMenuSelection('git'));
  };

  const handleHideEditorPlaceholder = () => {
    dispatch(toggleEditorPlaceholderVisiblity(true));
  };

  const handleChromeExtension = () => {
    shell.openExternal(
      'https://chrome.google.com/webstore/detail/monokle-cloud-chrome-exte/loojojkleiolidaodalflgbmaijeibob?hl=en'
    );
  };

  const handleCLI = () => {
    shell.openExternal('https://monokle.io/download');
  };

  return (
    <S.Container>
      <div>
        <S.ImageContainer>
          <S.Image src={MonacoPlaceholderImage} />
        </S.ImageContainer>
        <S.Title>
          Select a resource on the left to edit
          <br />
          Want to go further? Try these shortcuts
        </S.Title>
        <S.Text>
          <S.InfoLink onClick={handleDashboard}>Everything about your Cluster live</S.InfoLink>
        </S.Text>

        {!isInClusterMode && (
          <>
            <S.Text>
              <S.InfoLink onClick={handleHelmCharts}>Preview Helm Charts</S.InfoLink>
            </S.Text>
            <S.Text>
              <S.InfoLink onClick={handleKustomization}>Preview Kustomization</S.InfoLink>
            </S.Text>
            <S.Text>
              <S.InfoLink onClick={handleGitOperations}>Git operations</S.InfoLink>
            </S.Text>
          </>
        )}

        <S.Text>
          <S.InfoLink onClick={handleValidation}>Validate your resources</S.InfoLink>
        </S.Text>
        <S.Text>
          <S.InfoLink onClick={handleChromeExtension}>Get the Chrome extension for GitHub</S.InfoLink>
        </S.Text>
        <S.Text>
          <S.InfoLink onClick={handleCLI}>Get the CLI</S.InfoLink>
        </S.Text>
        <S.Info>
          <S.InfoLink onClick={handleHideEditorPlaceholder}>Hide this</S.InfoLink>
          <span> (You can re-enable this from the settings panel)</span>
        </S.Info>
      </div>
    </S.Container>
  );
};
