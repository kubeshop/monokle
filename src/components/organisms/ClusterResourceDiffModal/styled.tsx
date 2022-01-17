import {Modal, Tag} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const StyledModal = styled(Modal)`
  .ant-modal-close {
    color: ${Colors.grey700};
  }
  .ant-modal-header {
    background-color: ${Colors.grey1000};
    border-bottom: 1px solid ${Colors.grey900};
  }
  .ant-modal-body {
    background-color: ${Colors.grey1000};
    padding: 0px;
  }
  .ant-modal-footer {
    background-color: ${Colors.grey1000};
    border-top: 1px solid ${Colors.grey900};
    padding: 8px;
  }

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

export const FileSelectContainer = styled.div`
  margin: 0 auto;
`;

export const MonacoDiffContainer = styled.div<{height: string; width: string}>`
  ${props => `
    height: ${props.height};
    width: ${props.width};
  `}
  padding: 8px;

  & .monaco-editor .monaco-editor-background {
    background-color: ${Colors.grey1000} !important;
  }
  & .monaco-editor .margin {
    background-color: ${Colors.grey1000} !important;
  }
  & .diffOverview {
    background-color: ${Colors.grey1000} !important;
  }
`;

export const StyledTag = styled(Tag)`
  padding: 5px 10px;
  font-size: 14px;
  font-weight: 600;
`;

export const StyledSwitchLabel = styled.span`
  margin-left: 8px;
  cursor: pointer;
`;

export const SwitchContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 16px;
`;

export const TagsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  padding-bottom: 5px;
`;

export const TitleContainer = styled.div`
  display: flex;
  align-items: center;
`;
