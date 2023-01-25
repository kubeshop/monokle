import {Collapse, Modal as RawModal} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const LeftContainer = styled.div`
  background-color: #1d1d1d;
  padding: 25px;
`;

export const Modal = styled(RawModal)`
  .ant-modal-header,
  .ant-modal-body {
    background-color: #131515;
  }

  .ant-modal-body {
    padding: 0px;
    display: grid;
    grid-template-columns: 2fr 3fr;
  }
`;

export const NoTemplatesMessage = styled.div`
  color: ${Colors.grey9};
  padding: 16px;
  font-weight: 700;
`;

export const TemplatesCollapse = styled(Collapse)``;
