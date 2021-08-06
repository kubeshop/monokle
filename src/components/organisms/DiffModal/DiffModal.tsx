import * as React from 'react';
import styled from 'styled-components';
import {Button, Modal} from 'antd';
import {MonacoDiffEditor} from 'react-monaco-editor';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {useEffect, useState} from 'react';
import {stringify} from 'yaml';

import {KUBESHOP_MONACO_DIFF_THEME} from '@utils/monaco';

import Colors from '@styles/Colors';
import {applyWithConfirm} from '@organisms/ActionsPane/ActionsPane';
import {performResourceDiff} from '@redux/thunks/diffResource';
import {K8sResource} from '@models/k8sresource';

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

const LeftButton = styled(Button)`
  float: left;
`;

const DiffModal = () => {
  const dispatch = useAppDispatch();

  const diffContent = useAppSelector(state => state.main.diffContent);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const diffResourceId = useAppSelector(state => state.main.diffResource);
  const [diffResource, setDiffResource] = useState<K8sResource>();
  const [resourceContent, setResourceContent] = useState<string>();
  const fileMap = useAppSelector(state => state.main.fileMap);
  const kubeconfig = useAppSelector(state => state.config.kubeconfig);
  const [isVisible, setVisible] = useState(false);

  const options = {
    renderSideBySide: true,
    minimap: {
      enabled: false,
    },
  };

  useEffect(() => {
    if (resourceMap && diffResourceId) {
      const resource = resourceMap[diffResourceId];
      if (resource) {
        setDiffResource(resource);
        setResourceContent(stringify(resource.content, {sortMapEntries: true}));
      }
    }

    setVisible(Boolean(performResourceDiff) && Boolean(resourceMap) && Boolean(diffContent));
  }, [diffContent]);

  const handleApply = () => {
    if (diffResourceId) {
      const resource = resourceMap[diffResourceId];
      if (resource) {
        applyWithConfirm(resource, resourceMap, fileMap, dispatch, kubeconfig);
      }
    }
  };

  const handleRefresh = () => {
    if (diffResourceId) {
      dispatch(performResourceDiff(diffResourceId));
    }
  };

  const handleOk = () => {
    dispatch(performResourceDiff(''));
  };

  return (
    <StyledModal
      title={`Resource Diff on ${diffResource ? diffResource.name : ''}`}
      visible={isVisible}
      centered
      width={1000}
      onCancel={handleOk}
      footer={
        <>
          <LeftButton onClick={handleOk}>Close</LeftButton>
          <LeftButton onClick={handleRefresh}>Refresh</LeftButton>
          <Button type="primary" ghost onClick={handleApply}>
            Apply
          </Button>
        </>
      }
    >
      <MonacoDiffEditor
        width="1000"
        height="600"
        language="yaml"
        original={resourceContent}
        value={diffContent}
        options={options}
        theme={KUBESHOP_MONACO_DIFF_THEME}
      />
    </StyledModal>
  );
};

export default DiffModal;
