import {Input as RawInput, Tag as RawTag} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const AddTagHelper = styled.span`
  color: ${Colors.grey7};
  font-size: 12px;
  font-weight: 500;
  position: absolute;
  top: -25px;
  right: 0px;
`;

export const Input = styled(RawInput)`
  padding: 0;
  padding-left: 3px;
  width: 100%;
  min-width: 75px;
`;

export const InputContainer = styled.div<{$width: number}>`
  ${({$width}) => `
    width: ${$width}px;
  `}
`;

export const InputTagsContainer = styled.div<{$disabled: boolean | undefined}>`
  ${({$disabled}) => {
    if ($disabled) {
      return `
        cursor: not-allowed !important;
      `;
    }
  }}

  position: relative;
  padding: 3px 4px;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  cursor: text;
`;

export const Tag = styled(RawTag)`
  background-color: rgba(255, 255, 255, 0.08);
  border-color: rgb(48, 48, 48);
  font-size: 14px;
  line-height: 22px;
  color: rgba(255, 255, 255, 0.85);
  height: 24px;
  margin: 0;
`;
