import {Button, Modal, Switch, Tag} from 'antd';
import {useEffect, useMemo, useState} from 'react';
import {MonacoDiffEditor} from 'react-monaco-editor';
import styled from 'styled-components';
import {parse, stringify} from 'yaml';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateResource} from '@redux/reducers/main';
import {applyResourceWithConfirm} from '@redux/services/applyResourceWithConfirm';
import {performResourceDiff} from '@redux/thunks/diffResource';

import {K8sResource} from '@models/k8sresource';

// import flatten, {unflatten} from 'flat';
import Icon from '@components/atoms/Icon';

import {ArrowLeftOutlined, ArrowRightOutlined} from '@ant-design/icons';

import {KUBESHOP_MONACO_THEME} from '@utils/monaco';
import {removeIgnoredPathsFromResourceContent} from '@utils/resources';

import Colors from '@styles/Colors';

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

const TagsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 40px;
  padding-bottom: 5px;
`;

const StyledTag = styled(Tag)`
  padding: 5px 10px;
  font-size: 14px;
  font-weight: 600;
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
  const kubeconfigContext = useAppSelector(state => state.config.kubeConfig.currentContext);
  const [isVisible, setVisible] = useState(false);
  const [shouldDiffIgnorePaths, setShouldDiffIgnorePaths] = useState<boolean>(true);

  const options = {
    renderSideBySide: true,
    minimap: {
      enabled: false,
    },
  };

  useEffect(() => {
    if (!diffResourceId) {
      return;
    }
    setDiffResource(resourceMap[diffResourceId]);
  }, [diffResourceId, resourceMap]);

  useEffect(() => {
    if (resourceMap && diffResource) {
      setResourceContent(stringify(diffResource.content, {sortMapEntries: true}));
    }

    setVisible(Boolean(performResourceDiff) && Boolean(resourceMap) && Boolean(diffContent));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diffContent, diffResource]);

  useEffect(() => {
    if (!isVisible) {
      setShouldDiffIgnorePaths(true);
    }
  }, [isVisible]);

  const cleanDiffContent = useMemo(() => {
    if (!diffContent) return undefined;
    if (!diffResource?.content) return undefined;
    if (!shouldDiffIgnorePaths) {
      return diffContent;
    }
    const diffContentObject = parse(diffContent);
    const newDiffContentObject = removeIgnoredPathsFromResourceContent(diffContentObject);
    const cleanDiffContentString = stringify(newDiffContentObject, {sortMapEntries: true});
    return cleanDiffContentString;
  }, [diffContent, diffResource?.content, shouldDiffIgnorePaths]);

  const areResourcesDifferent = useMemo(() => {
    return resourceContent !== cleanDiffContent;
  }, [resourceContent, cleanDiffContent]);

  const handleApply = () => {
    if (diffResourceId) {
      const resource = resourceMap[diffResourceId];
      if (resource) {
        applyResourceWithConfirm(resource, resourceMap, fileMap, dispatch, kubeconfig, kubeconfigContext || '', {
          isClusterPreview: previewType === 'cluster',
          shouldPerformDiff: true,
        });
      }
    }
  };

  const handleReplace = () => {
    if (!diffResource || !shouldDiffIgnorePaths || !cleanDiffContent) {
      return;
    }
    dispatch(
      updateResource({
        resourceId: diffResource.id,
        content: cleanDiffContent,
        preventSelectionAndHighlightsUpdate: true,
      })
    );
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
        </>
      }
    >
      <TagsContainer>
        <StyledTag>Local</StyledTag>
        <Button
          type="primary"
          ghost
          onClick={handleApply}
          icon={<Icon name="kubernetes" />}
          disabled={!areResourcesDifferent}
        >
          Deploy local resource to cluster <ArrowRightOutlined />
        </Button>
        <Button
          type="primary"
          ghost
          onClick={handleReplace}
          disabled={!shouldDiffIgnorePaths || !areResourcesDifferent}
        >
          <ArrowLeftOutlined /> Replace local resource with cluster resource
        </Button>
        <StyledTag>Cluster</StyledTag>
      </TagsContainer>
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
