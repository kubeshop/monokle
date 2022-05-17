import {SectionInstance} from '@models/navigator';

import * as S from './DockerImagesSectionNameDisplay.styled';

interface IProps {
  sectionInstance: SectionInstance;
}

const DockerImagesSectionNameDisplay: React.FC<IProps> = props => {
  const {
    sectionInstance: {itemIds},
  } = props;

  return (
    <S.NameDisplayContainer>
      <div>
        <S.ImagesCount>{itemIds.length} images in your project</S.ImagesCount>
        <S.HelperLabel>Find out where they are used and get + info</S.HelperLabel>
      </div>

      <S.SearchInput
        placeholder="Search project images"
        // value={searchedValue}
        // onChange={e => setSearchedValue(e.target.value)}
      />
    </S.NameDisplayContainer>
  );
};

export default DockerImagesSectionNameDisplay;
