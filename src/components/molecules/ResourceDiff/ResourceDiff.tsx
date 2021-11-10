import {Button, Switch, Tag} from 'antd';
import {useMemo, useState} from 'react';
import {MonacoDiffEditor} from 'react-monaco-editor';
import styled from 'styled-components';
import {parse, stringify} from 'yaml';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateResource} from '@redux/reducers/main';
import {applyResourceWithConfirm} from '@redux/services/applyResourceWithConfirm';

import {K8sResource} from '@models/k8sresource';

import Icon from '@components/atoms/Icon';

import {ArrowLeftOutlined, ArrowRightOutlined} from '@ant-design/icons';

import {KUBESHOP_MONACO_THEME} from '@utils/monaco';
import {removeIgnoredPathsFromResourceContent} from '@utils/resources';

import Colors from '@styles/Colors';

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
  /* margin-right: 20px; */
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 12px;
`;

const StyledSwitchLabel = styled.span`
  margin-left: 8px;
  cursor: pointer;
`;

const TagsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px;
  padding-bottom: 5px;
`;

const StyledTag = styled(Tag)`
  padding: 5px 10px;
  font-size: 14px;
  font-weight: 600;
`;

const ResourceDiff = (props: {
  localResource: K8sResource;
  clusterResourceText: string;
  isInClusterDiff?: boolean;
  onApply?: () => void;
}) => {
  const dispatch = useAppDispatch();
  const {localResource, clusterResourceText, isInClusterDiff, onApply} = props;

  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const previewType = useAppSelector(state => state.main.previewType);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const kubeconfig = useAppSelector(state => state.config.kubeconfigPath);
  const kubeconfigContext = useAppSelector(state => state.config.kubeConfig.currentContext);
  const [shouldDiffIgnorePaths, setShouldDiffIgnorePaths] = useState<boolean>(true);

  const options = {
    renderSideBySide: true,
    minimap: {
      enabled: false,
    },
  };

  const localResourceText = useMemo(() => {
    return stringify(localResource.content, {sortMapEntries: true});
  }, [localResource]);

  const cleanClusterResourceText = useMemo(() => {
    if (!shouldDiffIgnorePaths) {
      return clusterResourceText;
    }
    const originalClusterResourceContent = parse(clusterResourceText);
    const cleanClusterResourceContent = removeIgnoredPathsFromResourceContent(originalClusterResourceContent);

    return stringify(cleanClusterResourceContent, {sortMapEntries: true});
  }, [clusterResourceText, shouldDiffIgnorePaths]);

  const areResourcesDifferent = useMemo(() => {
    return localResourceText !== cleanClusterResourceText;
  }, [localResourceText, cleanClusterResourceText]);

  const handleApply = () => {
    if (onApply) {
      onApply();
    }
    applyResourceWithConfirm(localResource, resourceMap, fileMap, dispatch, kubeconfig, kubeconfigContext || '', {
      isClusterPreview: previewType === 'cluster',
      shouldPerformDiff: true,
      isInClusterDiff,
    });
  };

  const handleReplace = () => {
    if (!shouldDiffIgnorePaths) {
      return;
    }
    dispatch(
      updateResource({
        resourceId: localResource.id,
        content: cleanClusterResourceText,
        preventSelectionAndHighlightsUpdate: true,
      })
    );
  };

  return (
    <>
      <MonacoDiffContainer>
        <MonacoDiffEditor
          width="980"
          height="700"
          language="yaml"
          original={localResourceText}
          value={cleanClusterResourceText}
          options={options}
          theme={KUBESHOP_MONACO_THEME}
        />
      </MonacoDiffContainer>
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
      <SwitchContainer onClick={() => setShouldDiffIgnorePaths(!shouldDiffIgnorePaths)}>
        <Switch checked={shouldDiffIgnorePaths} />
        <StyledSwitchLabel>Hide ignored fields</StyledSwitchLabel>
      </SwitchContainer>
    </>
  );
};

export default ResourceDiff;
