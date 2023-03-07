import {toggleEditorPlaceholderVisiblity} from '@redux/appConfig';
import {useAppDispatch} from '@redux/hooks';

import MonacoPlaceholderImageNew from '@assets/MonacoPlaceholderImageNew.svg';

import * as S from './MonacoPlaceholder.styled';

export const MonacoPlaceholder = () => {
  const dispatch = useAppDispatch();

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
        <S.Text>
          <S.InfoLink>Everything about your Cluster live</S.InfoLink>
        </S.Text>
        <S.Text>
          <S.InfoLink>Preview Helm Charts</S.InfoLink>
        </S.Text>
        <S.Text>
          <S.InfoLink>Preview Kustomization</S.InfoLink>
        </S.Text>
        <S.Text>
          <S.InfoLink>Git operations</S.InfoLink>
        </S.Text>
        <S.Text>
          <S.InfoLink>Validate your resources</S.InfoLink>
        </S.Text>
        <S.Text>
          <S.InfoLink>Get the Chrome extension for GitHub</S.InfoLink>
        </S.Text>
        <S.Text>
          <S.InfoLink>Get the CLI</S.InfoLink>
        </S.Text>
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
// <S.Info>
//   <S.InfoLink onClick={handleHideEditorPlaceholder}>Hide this</S.InfoLink>
//   <span> (You can re-enable this from the settings panel)</span>
// </S.Info>
