import {MonacoDiffEditor} from 'react-monaco-editor';
import {useAsync, useMeasure} from 'react-use';

import {Modal as RawModal} from 'antd';

import styled from 'styled-components';

import {KUBESHOP_MONACO_THEME} from '@utils/monaco';

import {CommandOptions} from '@shared/models/commands';
import {Colors} from '@shared/styles';
import {runCommandInMainThread} from '@shared/utils/commands';

interface IProps {
  leftSideCommand: CommandOptions;
  rightSideCommand: CommandOptions;
  onClose: () => void;
  onOk: () => void;
  okText: string;
}

const monacoEditorOptions = {
  readOnly: true,
  renderSideBySide: true,
  minimap: {
    enabled: false,
  },
};

const HelmDryRunDiffModal = ({leftSideCommand, rightSideCommand, onClose, onOk, okText}: IProps) => {
  const [containerRef, {height: containerHeight, width: containerWidth}] = useMeasure<HTMLDivElement>();

  const {value: leftSideSource = '', loading: isLeftSideLoading} = useAsync(async () => {
    const result = await runCommandInMainThread(leftSideCommand);
    if (result.stderr) {
      throw new Error(result.stderr);
    }
    return result.stdout;
  });

  const {value: rightSideSource = '', loading: isRightSideLoading} = useAsync(async () => {
    const result = await runCommandInMainThread(rightSideCommand);
    if (result.stderr) {
      throw new Error(result.stderr);
    }
    return result.stdout;
  });

  return isLeftSideLoading || isRightSideLoading ? null : (
    <Modal open onCancel={onClose} onOk={onOk} okText={okText} width="100%">
      <MonacoDiffContainer width="100%" height="calc(70vh - 80px)" ref={containerRef}>
        <MonacoDiffEditor
          width={containerWidth}
          height={containerHeight}
          language="yaml"
          original={leftSideSource}
          value={rightSideSource}
          options={monacoEditorOptions}
          theme={KUBESHOP_MONACO_THEME}
        />
      </MonacoDiffContainer>
    </Modal>
  );
};

export default HelmDryRunDiffModal;

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
    padding-top: 40px;
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
