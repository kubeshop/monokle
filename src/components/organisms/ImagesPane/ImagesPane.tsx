import {SectionRenderer} from '@molecules';

import {TitleBarWrapper} from '@components/atoms/StyledComponents/TitleBarWrapper';

import ImagesSectionBlueprint from '@src/navsections/ImagesSectionBlueprint';

import {TitleBar} from '@monokle/components';

import * as S from './ImagesPane.styled';

const ImagesPane: React.FC = () => {
  return (
    <S.ImagesPaneContainer id="ImagesPane">
      <TitleBarWrapper>
        <TitleBar title="Images" />
      </TitleBarWrapper>
      <S.List id="images-section-container">
        <SectionRenderer sectionBlueprint={ImagesSectionBlueprint} level={0} isLastSection={false} />
      </S.List>
    </S.ImagesPaneContainer>
  );
};

export default ImagesPane;
