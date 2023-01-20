import {useState} from 'react';

import DefaultLayout from '@assets/DefaultLayout.svg';
import EditorLayout from '@assets/EditorLayout.svg';

// import LayoutDark from '@assets/LayoutDark.svg';
// import LayoutWhite from '@assets/LayoutWhite.svg';
import * as S from './TitleCardDescription.styled';

const TitleCardDescription = () => {
  const [selectedLayout, setSelectedLayout] = useState('EDITOR');
  // const [selectedTheme, setSelectedTheme] = useState('DARK');

  return (
    <S.DescriptionContainer>
      <S.OptionsContainer>
        <S.LayoutOption
          $selected={selectedLayout === 'EDITOR'}
          onClick={() => {
            setSelectedLayout('EDITOR');
          }}
        >
          <S.LayoutContainer>
            <S.LayoutTitle>Editor Layout</S.LayoutTitle>
            <S.LayoutContent>Left pane collapses when editing so you can focus</S.LayoutContent>
          </S.LayoutContainer>
          <img src={EditorLayout} />
        </S.LayoutOption>

        <S.LayoutOption
          $selected={selectedLayout === 'DEFAULT'}
          onClick={() => {
            setSelectedLayout('DEFAULT');
          }}
        >
          <S.LayoutContainer>
            <S.LayoutTitle>Default Layout</S.LayoutTitle>
            <S.LayoutContent>You manually show/hide and move your panes</S.LayoutContent>
          </S.LayoutContainer>
          <img src={DefaultLayout} />
        </S.LayoutOption>
      </S.OptionsContainer>

      {/* <S.OptionsContainer>
          <S.ThemeOption
            $selected={selectedTheme === 'DARK'}
            onClick={() => {
              setSelectedTheme('DARK');
            }}
          >
            <img src={LayoutDark} />
          </S.ThemeOption>
  
          <S.ThemeOption
            $selected={selectedTheme === 'LIGHT'}
            onClick={() => {
              setSelectedTheme('LIGHT');
            }}
          >
            <img src={LayoutWhite} />
          </S.ThemeOption>
        </S.OptionsContainer> */}
    </S.DescriptionContainer>
  );
};

export default TitleCardDescription;
