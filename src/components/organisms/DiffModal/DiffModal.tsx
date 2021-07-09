import * as React from 'react';
import styled from 'styled-components';
import {Button, Modal} from 'antd';
import {MonacoDiffEditor} from 'react-monaco-editor';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {useEffect, useState} from 'react';
import {stringify} from 'yaml';
import {diffResource} from '@redux/reducers/thunks';

import { KUBESHOP_MONACO_DIFF_THEME } from "@utils/monaco";

import Colors from "@styles/Colors";

const StyledModal = styled(Modal)`
  .ant-modal-close {
    color: ${Colors.grey700};
  }
  .ant-modal-header {
    background-color: ${Colors.grey1000};
    border-bottom: 1px solid ${Colors.grey900};
  }
  .ant-modal-body {
    background-color: ${Colors.grey1000};
    padding-right: 0;
    padding-left: 0;
  }
  .ant-modal-footer {
    background-color: ${Colors.grey1000};
    border-top: 1px solid ${Colors.grey900};
  }
`;

const DiffModal = () => {
  const dispatch = useAppDispatch();

  const diffContent = useAppSelector(state => state.main.diffContent);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const diffResourceId = useAppSelector(state => state.main.diffResource);

  const [isVisible, setVisible] = useState(false);

  const resourceContent = diffResourceId && resourceMap ? stringify(resourceMap[diffResourceId].content, {sortMapEntries: true}) : '';
  const options = {
    renderSideBySide: true,
  };

  useEffect(() => {
    /* eslint-disable react-hooks/exhaustive-deps */
    setVisible(Boolean(diffResource) && Boolean(resourceMap) && Boolean(diffContent));
  }, [diffContent]);

  const handleOk = () => {
    dispatch(diffResource(''));
  };

  return (
    <StyledModal title='Resource Diff'
           visible={isVisible}
           centered
           width={1000}
           onCancel={handleOk}
           footer={[
             <Button key='submit' type='primary' onClick={handleOk}>Close</Button>,
           ]}>
      <MonacoDiffEditor
        width='1000'
        height='600'
        language='yaml'
        original={resourceContent}
        value={diffContent}
        options={options}
        theme={KUBESHOP_MONACO_DIFF_THEME}
      />
    </StyledModal>);
};

export default DiffModal;
