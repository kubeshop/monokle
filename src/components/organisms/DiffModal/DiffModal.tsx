import styled from 'styled-components';
import {Button, Modal, Switch} from 'antd';
import {MonacoDiffEditor} from 'react-monaco-editor';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {useEffect, useMemo, useState} from 'react';
import {parse, stringify} from 'yaml';

import Icon from '@components/atoms/Icon';

import {KUBESHOP_MONACO_THEME} from '@utils/monaco';

import Colors from '@styles/Colors';
import {applyResourceWithConfirm} from '@redux/services/applyResourceWithConfirm';
import {performResourceDiff} from '@redux/thunks/diffResource';
import {K8sResource} from '@models/k8sresource';
import {removeIgnoredPathsFromResourceContent} from '@utils/resources';

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
    padding: 0px;
  }
  .ant-modal-footer {
    background-color: ${Colors.grey1000};
    border-top: 1px solid ${Colors.grey900};
    padding: 8px;
  }
`;

const LeftButton = styled(Button)`
  float: left;
`;

const MonacoDiffContainer = styled.div`
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

const SwitchContainer = styled.span`
  margin-right: 20px;
`;

const StyledSwitchLabel = styled.span`
  margin-left: 8px;
  cursor: pointer;
`;

const DiffModal = () => {
  const dispatch = useAppDispatch();

  // this is the content of the cluster resource
  const diffContent = useAppSelector(state => state.main.diffContent);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const diffResourceId = useAppSelector(state => state.main.diffResourceId);
  // this is the local resource
  const [diffResource, setDiffResource] = useState<K8sResource>();
  const [resourceContent, setResourceContent] = useState<string>();
  const previewType = useAppSelector(state => state.main.previewType);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const kubeconfig = useAppSelector(state => state.config.kubeconfigPath);
  const [isVisible, setVisible] = useState(false);
  const [shouldDiffIgnorePaths, setShouldDiffIgnorePaths] = useState<boolean>(true);

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
    setShouldDiffIgnorePaths(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diffContent]);

  const cleanDiffContent = useMemo(() => {
    if (!diffContent) return undefined;
    if (!diffResource?.content) return undefined;
    if (!shouldDiffIgnorePaths) {
      return diffContent;
    }
    const diffContentObject = parse(diffContent);
    const newDiffContentObject = removeIgnoredPathsFromResourceContent(diffContentObject);
    const diffResourceContentKeys = Object.keys(diffResource.content);
    // order the keys of the new diffContentObject by the local resource(diffResource here) keys order
    const cleanDiffContentObject = Object.keys(newDiffContentObject)
      .sort((a, b) => {
        return diffResourceContentKeys.indexOf(a) - diffResourceContentKeys.indexOf(b);
      })
      .reduce((acc: any, key) => {
        acc[key] = newDiffContentObject[key];
        return acc;
      }, {});
    return stringify(cleanDiffContentObject);
  }, [diffContent, diffResource?.content, shouldDiffIgnorePaths]);

  const handleApply = () => {
    if (diffResourceId) {
      const resource = resourceMap[diffResourceId];
      if (resource) {
        applyResourceWithConfirm(resource, resourceMap, fileMap, dispatch, kubeconfig, {
          isClusterPreview: previewType === 'cluster',
          shouldPerformDiff: true,
        });
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
          <SwitchContainer onClick={() => setShouldDiffIgnorePaths(!shouldDiffIgnorePaths)}>
            <Switch checked={shouldDiffIgnorePaths} />
            <StyledSwitchLabel>Hide ignored fields</StyledSwitchLabel>
          </SwitchContainer>
          <Button type="primary" ghost onClick={handleApply} icon={<Icon name="kubernetes" />}>
            Deploy
          </Button>
        </>
      }
    >
      <MonacoDiffContainer>
        <MonacoDiffEditor
          width="980"
          height="600"
          language="yaml"
          original={resourceContent}
          value={cleanDiffContent}
          options={options}
          theme={KUBESHOP_MONACO_THEME}
        />
      </MonacoDiffContainer>
    </StyledModal>
  );
};

export default DiffModal;
