import {Modal as AntModal, Input, Steps} from 'antd';

import styled from 'styled-components';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

export const Container = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-column-gap: 10px;
  max-height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
  margin: 24px 0px;
  ${GlobalScrollbarStyle};
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

export const Step = styled(Steps.Step)`
  & .ant-steps-item-title {
    width: 155px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
`;
