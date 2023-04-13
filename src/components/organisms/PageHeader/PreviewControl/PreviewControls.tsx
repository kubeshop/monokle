import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';

import {ExitButton} from './ExitButton';
import {PreviewLabel} from './PreviewLabel';

export function PreviewControls() {
  const preview = useAppSelector(state => state.main.preview);

  if (!preview) {
    return null;
  }

  return (
    <Box>
      <PreviewLabel />
      <ExitButton />
    </Box>
  );
}

const Box = styled.div`
  display: flex;
  gap: 8px;
`;
