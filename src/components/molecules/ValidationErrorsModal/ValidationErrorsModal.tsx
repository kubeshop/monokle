import React from 'react';

import {Modal} from 'antd';

import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {hideValidationErrorsModal} from '@redux/reducers/ui';

const StyledContainer = styled.div`
  margin: 20px 10px;
  overflow-y: auto;
  display: block;
  height: 100%;
  max-height: 500px;
`;

const StyledErrorList = styled.ul`
  margin: 0;
  padding: 5px;
  padding-left: 15px;
  height: 100%;
  width: 100%;
  display: block;
`;

const StyledErrorProperty = styled.span`
  font-weight: 600;
  display: block;
`;
const StyledErrorMessage = styled.span`
  margin-left: 5px;
  font-style: italic;
  display: block;
`;

const ValidationErrorsModal = () => {
  const dispatch = useAppDispatch();
  const {errors, isVisible} = useAppSelector(state => state.ui.validationErrorsModal);

  const closeModal = () => {
    dispatch(hideValidationErrorsModal());
  };

  return (
    <Modal centered visible={isVisible} onCancel={closeModal} footer={null}>
      <StyledContainer>
        <StyledErrorList>
          {errors.map(error => {
            return (
              <li key={`${error.property}:${error.message}`}>
                <StyledErrorProperty>{error.property}</StyledErrorProperty>
                <StyledErrorMessage>{error.message}</StyledErrorMessage>
              </li>
            );
          })}
        </StyledErrorList>
      </StyledContainer>
    </Modal>
  );
};

export default ValidationErrorsModal;
