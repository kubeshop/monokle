import {useRef} from 'react';

import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';
import {kustomizeListSelector} from '@redux/selectors/kustomizeSelectors';

const ROW_HEIGHT = 23;

const KustomizeList: React.FC = () => {
  const list = useAppSelector(kustomizeListSelector);
  const ref = useRef<HTMLUListElement>(null);

  console.log('List:', list);

  return <ListContainer ref={ref}>Test</ListContainer>;
};

export default KustomizeList;

// Styled Components

const ListContainer = styled.ul`
  height: 100%;
  overflow-y: auto;
  padding: 0 0 12px;
`;
