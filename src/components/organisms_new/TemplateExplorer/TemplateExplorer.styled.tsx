import {Modal as RawModal} from 'antd';

import styled from 'styled-components';

export const LeftContainer = styled.div`
  background-color: #1d1d1d;
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
