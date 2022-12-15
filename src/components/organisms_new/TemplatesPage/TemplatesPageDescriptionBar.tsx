import {shell} from 'electron';

import {useCallback} from 'react';

import {Icon} from '@atoms';

import * as S from './TemplatesPageDescriptionBar.styled';

const TemplatesPageDescriptionBar: React.FC = () => {
  // // const dispatch = useAppDispatch();
  // // const inspection = useAppSelector(state => state.compare.current.inspect);
  // // const comparison = useAppSelector(state => selectComparison(state.compare, inspection?.comparison));
  // const typeLabel = inspection?.type === 'diff' ? 'diff' : 'content';
  // const resourceName =
  //   inspection?.type === 'left'
  //     ? comparison?.left?.name
  //     : inspection?.type === 'right'
  //     ? comparison?.right?.name
  //     : comparison?.left?.name ?? comparison?.right?.name;

  const handleBack = useCallback(() => {
    // dispatch(comparisonInspected());
  }, []);

  const openLearnMore = useCallback(() => shell.openExternal(''), ['']);

  return (
    <S.ActionBarDiv>
      <S.IconsContainer>
        <Icon name="template" style={{background: 'transparent'}} />
      </S.IconsContainer>

      <S.ActionBarRightDiv>
        <span>
          No need to be a K8s expert anymore! Create resources through easy forms.
          <S.Link onClick={openLearnMore}> Install additional templates using Plugins here</S.Link>
        </span>
      </S.ActionBarRightDiv>
    </S.ActionBarDiv>
  );
};

export default TemplatesPageDescriptionBar;
