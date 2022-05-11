import {Modal} from 'antd';

import styled from 'styled-components';

import Colors, {BackgroundColors} from '@styles/Colors';

export const Container = styled.div`
  display: block;
  margin: 0;
  padding: 0;
  height: 75vh;
  overflow: hidden;
`;

export const SkeletonContainer = styled.div`
  padding: 10px;
`;

export const StyledModal = styled(Modal)<{previewing: boolean}>`
  & .ant-modal-body {
    padding: 8px;
  }
  ${props =>
    props.previewing &&
    `
  & .ant-modal-header {
    background: ${BackgroundColors.previewModeBackground};
  }
  & .ant-modal-title {
    color: ${Colors.blackPure} !important;
  }
  & .ant-modal-close-x {
    color: ${Colors.blackPure} !important;
  }
`}

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

export const StyledButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
