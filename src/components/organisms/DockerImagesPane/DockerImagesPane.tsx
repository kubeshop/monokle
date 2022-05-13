import {TitleBar} from '@molecules';

import * as S from './DockerImagesPane.styled';

const DockerImagesPane: React.FC = () => {
  return (
    <S.DockerImagesPaneContainer id="DockerImagesPane">
      <TitleBar title="Docker Images" closable />
    </S.DockerImagesPaneContainer>
  );
};

export default DockerImagesPane;
