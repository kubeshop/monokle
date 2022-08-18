import {Modal as RawModal} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const ActionButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 30px;
`;

export const FileSelectContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 50px;
`;

export const Modal = styled(RawModal)`
  .ant-modal-close {
    color: ${Colors.grey700};
  }

  .ant-modal-header {
    background-color: ${Colors.grey1000};
    border: none;
  }

  .ant-modal-body {
    background-color: ${Colors.grey1000};
    padding-top: 0px;
    overflow-x: hidden;
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

export const SwitchContainer = styled.div`
  display: flex;
  justify-content: center;
  padding-right: 50px;
`;

export const SwitchLabel = styled.span`
  margin-left: 8px;
  cursor: pointer;
`;

export const Tag = styled.div`
  display: flex;
  gap: 10px;
  padding: 15px 10px;
  font-size: 14px;
  color: ${Colors.grey9};
  background-color: #31393c;
`;

export const TagsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
`;

export const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
`;
