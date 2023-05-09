import styled from 'styled-components';

import {useAppDispatch} from '@redux/hooks';
import {toggleLeftMenu} from '@redux/reducers/ui';

import {PaneCloseIcon} from '@monokle/components';
import {CLOSED_PANE_PLACEHOLDER_WIDTH} from '@shared/constants/constants';
import {Colors} from '@shared/styles/colors';

const ClosedPanePlaceholder: React.FC = () => {
  const dispatch = useAppDispatch();

  return (
    <Container>
      <PaneCloseIcon
        onClick={() => dispatch(toggleLeftMenu())}
        containerStyle={{position: 'absolute', top: '20px', right: '-8px', zIndex: 1000, transform: 'rotate(180deg)'}}
      />
    </Container>
  );
};

export default ClosedPanePlaceholder;

// Styled Components

const Container = styled.div`
  position: relative;
  overflow-x: visible;
  height: 100%;
  width: ${CLOSED_PANE_PLACEHOLDER_WIDTH}px;
  background-color: ${Colors.grey10};
`;
