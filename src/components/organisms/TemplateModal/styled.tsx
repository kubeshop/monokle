import {Modal as AntModal, Input} from 'antd';

import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
`;

export const Modal = styled(AntModal)`
  & .custom-modal-handle {
    position: absolute;
    top: 50%;
    height: 100%;
    width: 10px;
    background-color: transparent;
    cursor: col-resize;
    transform: translateY(-50%);
  }

  & .custom-modal-handle-e {
    right: -5px;
  }

  & .custom-modal-handle-w {
    left: -5px;
  }
`;

export const StyledTextArea = styled(Input.TextArea)`
  margin-top: 20px;
  width: 100%;
  ::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }
`;
