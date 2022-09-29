import styled from 'styled-components';

import Colors from '@styles/Colors';

export const ArrowIconExpanded = styled.span`
  display: flex;
  align-items: center;

  &: after {
    right: 3px;
    top: 50%;
    content: '';
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 4px 4px 0 4px;
    border-color: ${Colors.whitePure} transparent transparent transparent;
  }
`;

export const ArrowIconClosed = styled.span`
  display: flex;
  align-items: center;

  &: after {
    right: 3px;
    top: 50%;
    content: '';
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 4px 0 4px 4px;
    border-color: transparent transparent transparent ${Colors.whitePure};
  }
`;

type TitleWrapperProps = {
  opacityStep: number;
};

type TitleTextProps = {
  isBold?: boolean;
};

export const TitleWrapper = styled.div<TitleWrapperProps>`
  display: flex;
  background: ${({opacityStep}) => `rgba(17, 29, 44, ${opacityStep})`};
  margin: 1px 0;
  padding-left: 10px;
  cursor: pointer;
`;

export const TitleText = styled.p<TitleTextProps>`
  padding: 10px;
  margin: 0;
  ${({isBold}) =>
    isBold &&
    `
    font-weight: 600;
  `}
`;

export const ElementText = styled.p`
  padding: 5px;
  margin: 0;
`;

export const PropertyContainer = styled.div`
  margin-left: 5px;
`;

export const FieldContainer = styled.div`
  margin-left: 10px;
`;

export const FormContainer = styled.div`
  height: 100%;
  width: 100%;
  margin: 0px;
  padding-right: 10px;
  overflow-y: auto;
  overflow-x: hidden;

  .ant-input[disabled] {
    color: grey;
  }

  .ant-checkbox-disabled + span {
    color: grey;
  }

  .ant-form-item-extra {
    min-height: 0;
  }

  .ant-form-item-label {
    padding-top: 10px;
    padding-bottom: 0px;
  }

  .ant-form-item-explain {
    color: lightgrey;
    font-size: 12px;
    margin-top: 5px;
  }

  .object-property-expand {
    background: black;
    color: #177ddc;
    width: 120px;
    margin-left: 50px;
  }

  .array-item-add {
    background: black;
    color: #177ddc;
    width: 120px;
    margin-left: 50px;
  }

  .array-item-remove {
    background: black;
    color: #177ddc;
    width: 120px;
    margin-left: 50px;
    margin-top: 42px;
  }

  .array-item-move-up {
    background: black;
    color: #177ddc;
    width: 120px;
    margin-left: 50px;
  }

  .array-item-move-down {
    background: black;
    color: #177ddc;
    width: 120px;
    margin-left: 50px;
  }

  .ant-btn-dangerous {
    background: black;
    color: #177ddc;
    margin-left: 50px;
  }

  .field-string {
    margin-bottom: -10px;
  }
`;
