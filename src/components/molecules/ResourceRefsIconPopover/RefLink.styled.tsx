import styled from 'styled-components';

import Colors, {FontColors} from '@styles/Colors';

export const RefLinkContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const ResourceKindLabel = styled.span`
  margin-left: 8px;
  font-style: italic;
  color: ${Colors.grey7};
`;

export const TargetName = styled.span<{$isUnsatisfied: boolean; $isDisabled: boolean}>`
  ${({$isDisabled}) => {
    if (!$isDisabled) {
      return `
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }`;
    }
  }}
  ${({$isDisabled, $isUnsatisfied}) => {
    if ($isDisabled) {
      return `color: ${FontColors.grey}`;
    }
    if ($isUnsatisfied) {
      return `color: ${FontColors.warning};`;
    }
  }}
`;
