import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const DescriptionContainer = styled.div`
  padding: 8px 0px;
`;

export const LayoutContainer = styled.div`
  margin-right: 12px;
  padding: 4px 0 4px 4px;

  @media (max-width: 900px) {
    display: flex;
    align-items: center;
  }
`;

export const LayoutContent = styled.div`
  color: ${Colors.whitePure};
  font-size: 12px;
  display: none;

  @media (min-width: 925px) {
    display: block;
  }
`;

export const LayoutOption = styled.div<{$selected?: boolean}>`
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  height: 70px;
  cursor: pointer;
  background: ${({$selected}) => ($selected ? 'rgba(255, 255, 255, 0.2)' : 'inherit')};
  border: ${({$selected}) => ($selected ? `2px solid ${Colors.blue7}` : `1px solid ${Colors.blue11}`)};
  padding: ${({$selected}) => ($selected ? '3px' : '4px')};
`;

export const LayoutTitle = styled.div`
  color: ${Colors.whitePure};
  font-size: 12px;
  font-weight: 700;
`;

export const OptionsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 10px;
`;
