import {SectionRenderer} from '@molecules';

import ImagesSectionBlueprint from '@src/navsections/ImagesSectionBlueprint';

import {TitleBar} from '@monokle/components';

import * as S from './ImagesPane.styled';

const ImagesPane: React.FC = () => {
  return (
    <S.ImagesPaneContainer id="ImagesPane">
      <TitleBar title="Images" />
      <S.List id="images-section-container">
        <SectionRenderer sectionBlueprint={ImagesSectionBlueprint} level={0} isLastSection={false} />
      </S.List>
    </S.ImagesPaneContainer>
  );
};

export default ImagesPane;
