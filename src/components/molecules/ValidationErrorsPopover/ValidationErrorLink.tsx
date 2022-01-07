import React from 'react';

import styled from 'styled-components';

import {K8sResource, ResourceValidationError} from '@models/k8sresource';

import Colors, {FontColors} from '@styles/Colors';

const StyledRefText = styled.span`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const StyledPositionText = styled.span`
  margin-left: 5px;
  color: ${FontColors.grey};
`;

const StyledErrorMessage = styled.span`
  margin-left: 5px;
  font-style: italic;
  color: ${Colors.redError};
`;

const ValidationErrorLink = (props: {
  resource: K8sResource;
  validationError: ResourceValidationError;
  onClick?: () => void;
}) => {
  const {resource, validationError, onClick} = props;

  const linkText = validationError.property;

  const handleClick = () => {
    if (!onClick) {
      return;
    }
    onClick();
  };

  return (
    <div onClick={handleClick}>
      <StyledRefText>{linkText}</StyledRefText>
      {validationError.errorPos && (
        <StyledPositionText>
          {validationError.errorPos.line}:{validationError.errorPos.column}
        </StyledPositionText>
      )}
      <StyledErrorMessage>{validationError.message}</StyledErrorMessage>
    </div>
  );
};

export default ValidationErrorLink;
