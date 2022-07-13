import {Button as RawButton} from 'antd';

import styled from 'styled-components';

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

export const RemoveButton = styled(RawButton)`
  min-width: 24px;
`;
