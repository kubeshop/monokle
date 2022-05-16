import {SectionRenderer, TitleBar} from '@molecules';

import DockerImagesSectionBlueprint from '@src/navsections/DockerImagesSectionBlueprint';

import * as S from './DockerImagesPane.styled';

const DockerImagesPane: React.FC = () => {
  return (
    <S.DockerImagesPaneContainer id="DockerImagesPane">
      <TitleBar title="Docker Images" closable />

      <S.List id="docker-images-section-container">
        <SectionRenderer sectionBlueprint={DockerImagesSectionBlueprint} level={0} isLastSection={false} />
      </S.List>
    </S.DockerImagesPaneContainer>
  );
};

export default DockerImagesPane;
