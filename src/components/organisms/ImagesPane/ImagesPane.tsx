import {useMeasure} from 'react-use';

import {SectionRenderer, TitleBar} from '@molecules';

import ImagesSectionBlueprint from '@src/navsections/ImagesSectionBlueprint';

import * as S from './ImagesPane.styled';

const ImagesPane: React.FC = () => {
  const [listRef, {height}] = useMeasure<HTMLDivElement>();

  return (
    <S.ImagesPaneContainer id="ImagesPane">
      <TitleBar title="Images" closable />

      <S.List id="images-section-container" ref={listRef}>
        <SectionRenderer sectionBlueprint={ImagesSectionBlueprint} height={height} />
      </S.List>
    </S.ImagesPaneContainer>
  );
};

export default ImagesPane;
