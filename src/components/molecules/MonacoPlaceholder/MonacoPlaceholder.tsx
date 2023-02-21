import {toggleEditorPlaceholderVisiblity} from '@redux/appConfig';
import {useAppDispatch} from '@redux/hooks';

import MonacoPlaceholderImage from '@assets/MonacoPlaceholderImage.svg';

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
          <S.Image src={MonacoPlaceholderImage} />
        </S.ImageContainer>
        <S.Title>Need inspiration? Try any of these</S.Title>
        <S.Text>
          <b>Navigate and Validate</b>
          <span> Resources</span>
        </S.Text>
        <S.Text>
          <b>Preview</b>
          <span> Kustomizations and Helm Charts</span>
        </S.Text>
        <S.Text>
          <b>Compare</b>
          <span> sets of Resources</span>
        </S.Text>
        <S.Text>
          <span>Use </span>
          <b>Templates</b>
          <span> to easily create new Resources</span>
        </S.Text>
        <S.Info>
          <S.InfoLink onClick={handleHideEditorPlaceholder}>Hide this</S.InfoLink>
          <span> (You can re-enable this from the settings panel)</span>
        </S.Info>
      </div>
    </S.Container>
  );
};
