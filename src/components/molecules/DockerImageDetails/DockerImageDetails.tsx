import {useAppSelector} from '@redux/hooks';

import {Icon} from '@atoms';

import * as S from './DockerImageDetails.styled';

const DockerImageDetails: React.FC = () => {
  const selectedDockerImage = useAppSelector(state => state.main.selectedDockerImage);

  if (!selectedDockerImage) {
    return null;
  }

  return (
    <>
      <S.ImageName>
        <Icon name="docker-images" style={{fontSize: 20, paddingTop: '4px'}} />
        {selectedDockerImage.name}:{selectedDockerImage.tag}
      </S.ImageName>
    </>
  );
};

export default DockerImageDetails;
