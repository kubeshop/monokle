import {useMemo} from 'react';

import {useAppSelector} from '@redux/hooks';

import featureJson from '@src/feature-flags.json';

import PaneManagerLeftMenu from './PaneManagerLeftMenu';
import PaneManagerRightMenu from './PaneManagerRightMenu';

import * as S from './styled';

const PaneManagerRefactor: React.FC = () => {
  const isProjectLoading = useAppSelector(state => state.config.isProjectLoading);

  const gridColumns = useMemo(() => {
    let gridTemplateColumns = 'max-content 1fr';

    if (featureJson.ShowRightMenu) {
      gridTemplateColumns += ' max-content';
    }

    return gridTemplateColumns;
  }, []);

  return (
    <S.PaneManagerContainer $gridTemplateColumns={gridColumns}>
      <PaneManagerLeftMenu />

      {isProjectLoading ? <S.Skeleton /> : null}

      {featureJson.ShowRightMenu && <PaneManagerRightMenu />}
    </S.PaneManagerContainer>
  );
};

export default PaneManagerRefactor;
