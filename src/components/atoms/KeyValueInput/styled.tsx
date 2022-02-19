import {Button} from 'antd';

import styled from 'styled-components';

export const Container = styled.div`
  max-height: 800px;
  overflow-y: auto;
`;

export const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
export const TitleLabel = styled.span``;

export const KeyValueContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  grid-gap: 8px;
  align-items: center;
  margin: 10px 0;
`;

export const KeyValueRemoveButtonContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr max-content;
  grid-gap: 8px;
  align-items: center;
`;

export const StyledRemoveButton = styled(Button)`
  min-width: 24px;
`;
