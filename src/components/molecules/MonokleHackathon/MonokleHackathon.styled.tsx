import {Button, Modal as RawModal} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const CreateButton = styled(Button)`
  margin: 16px 0px 32px 0px;
`;

export const ErrorMessage = styled.div`
  color: ${Colors.redError};
  margin-top: 4px;
`;

export const NoContent = styled.div`
  color: ${Colors.grey6};
`;

export const Note = styled.div`
  font-size: 12px;
  color: ${Colors.grey7};
  margin-bottom: 16px;
`;

export const SpinContainer = styled.div`
  padding: 50px;
`;

export const Modal = styled(RawModal)`
  height: 75%;
  top: 45px;
  padding-bottom: 0px;

  .ant-modal-content {
    height: 100%;
  }

  .ant-modal-header,
  .ant-modal-body {
    background-color: #131515;
  }

  .ant-modal-body {
    height: 100%;
  }
`;
