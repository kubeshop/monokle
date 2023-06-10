import {Button, Input, Modal as RawModal} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const ModalBody = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  padding-bottom: 32px;
`;

export const LeftColumn = styled.div`
  position: relative;
  height: 100%;
  width: 50%;
  padding-right: 24px;
`;

export const RightColumn = styled.div`
  position: relative;
  height: 100%;
  padding-top: 40px;
  width: 50%;
`;

export const CreateButton = styled(Button)`
  margin: 32px 0px;
`;

export const ErrorMessage = styled.div`
  color: ${Colors.redError};
  margin-top: 4px;
`;

export const Note = styled.div<{$small?: boolean}>`
  font-size: ${props => (props.$small ? '12px' : '14px')};
  color: ${props => (props.$small ? Colors.grey7 : Colors.grey9)};
  margin-top: ${props => (props.$small ? '8px' : '16px')};
  margin-bottom: ${props => (props.$small ? '12px' : '24px')};
  ${props => props.$small && 'max-width: 50%;'};
`;

export const SpinContainer = styled.div`
  padding: 50px;
  width: 100%;
`;

export const Modal = styled(RawModal)`
  height: 75%;
  top: 45px;
  padding-bottom: 0px;

  .ant-modal-header,
  .ant-modal-body {
    background-color: #131515;
  }

  .ant-modal-body {
    height: calc(80vh);
  }

  .ant-modal-close-icon {
    font-size: 16px !important;
    color: ${Colors.grey5};
  }
`;

export const PlaceholderContainer = styled.div`
  position: relative;
  color: ${Colors.grey6};
  border: 1px dashed ${Colors.grey5};
  border-radius: 4px;
  height: calc(100% - 32px);
`;

export const PlaceholderBody = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 65%;

  & p:last-child {
    text-align: center;
  }
`;

export const NoContentTitle = styled.p`
  font-weight: 900;
  margin-top: 16px;
  margin-bottom: 4px;
`;

export const SettingsButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;

  & button {
    padding-right: 0px;
  }
`;

export const EnableValidationContainer = styled.div`
  margin-top: 16px;
  margin-bottom: 8px;
`;

export const EnableValidationToggle = styled.div`
  cursor: pointer;
  user-select: none;
`;

export const SettingsTitle = styled.h3`
  margin-top: 8px;
  margin-bottom: 8px;
  font-weight: 600;
`;

export const Title = styled.div`
  margin-top: 8px;
  font-size: 16px;
  font-weight: 700;
  color: ${Colors.grey9};
`;

export const TextArea = styled(Input.TextArea)`
  background-color: ${Colors.grey2};
  padding: 8px 12px;

  &::placeholder {
    color: ${Colors.grey7};
  }
`;
