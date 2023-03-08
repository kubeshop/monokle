import {toggleEditorPlaceholderVisiblity} from '@redux/appConfig';
import {useAppDispatch} from '@redux/hooks';
import {setExplorerSelectedSection, setLeftMenuSelection} from '@redux/reducers/ui';

import MonacoPlaceholderImageNew from '@assets/MonacoPlaceholderImageNew.svg';

import * as S from './MonacoPlaceholder.styled';

export const MonacoPlaceholder = () => {
  const dispatch = useAppDispatch();

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

  return (
    <S.Container>
      <div>
        <S.ImageContainer>
          <S.Image src={MonacoPlaceholderImageNew} />
        </S.ImageContainer>
        <S.Title>
          Select a resource on the left to edit
          <br />
          Want to go further? Try these shortcuts
        </S.Title>
        <S.Text>Everything about your Cluster live</S.Text>
        <S.Text>
          <S.InfoLink onClick={handleHelmCharts}>Preview Helm Charts</S.InfoLink>
        </S.Text>
        <S.Text>
          <S.InfoLink onClick={handleKustomization}>Preview Kustomization</S.InfoLink>
        </S.Text>
        <S.Text>
          <S.InfoLink onClick={handleGitOperations}>Git operations</S.InfoLink>
        </S.Text>
        <S.Text>
          <S.InfoLink onClick={handleValidation}>Validate your resources</S.InfoLink>
        </S.Text>
        <S.Text>
          <S.InfoLink href="https://chrome.google.com/webstore/detail/monokle-cloud-chrome-exte/loojojkleiolidaodalflgbmaijeibob?hl=en">
            Get the Chrome extension for GitHub
          </S.InfoLink>
        </S.Text>
        <S.Text>
          <S.InfoLink href="https://monokle.io/download">Get the CLI</S.InfoLink>
        </S.Text>
        <S.Info>
          <S.InfoLink onClick={handleHideEditorPlaceholder}>Hide this</S.InfoLink>
          <span> (You can re-enable this from the settings panel)</span>
        </S.Info>
      </div>
    </S.Container>
  );
};

// <S.Text>
//   <b>Navigate and Validate</b>
//   <span> Resources</span>
// </S.Text>
// <S.Text>
//   <b>Preview</b>
//   <span> Kustomizations and Helm Charts</span>
// </S.Text>
// <S.Text>
//   <b>Compare</b>
//   <span> sets of Resources</span>
// </S.Text>
// <S.Text>
//   <span>Use </span>
//   <b>Templates</b>
//   <span> to easily create new Resources</span>
// </S.Text>
