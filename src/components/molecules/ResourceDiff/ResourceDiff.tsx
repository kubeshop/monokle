import {useMemo, useState} from 'react';
import {MonacoDiffEditor} from 'react-monaco-editor';
import {useMeasure} from 'react-use';

import {Button, Switch, Tag} from 'antd';

import {ArrowLeftOutlined, ArrowRightOutlined} from '@ant-design/icons';

import {languages} from 'monaco-editor/esm/vs/editor/editor.api';
import styled from 'styled-components';
import {parse, stringify} from 'yaml';

import {PREVIEW_PREFIX} from '@constants/constants';

import {K8sResource} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateResource} from '@redux/reducers/main';
import {isKustomizationResource} from '@redux/services/kustomize';
import {applyResource} from '@redux/thunks/applyResource';

import Icon from '@components/atoms/Icon';

import useResourceYamlSchema from '@hooks/useResourceYamlSchema';

import {useWindowSize} from '@utils/hooks';
import {KUBESHOP_MONACO_THEME} from '@utils/monaco';
import {removeIgnoredPathsFromResourceContent} from '@utils/resources';

import Colors from '@styles/Colors';

import ModalConfirmWithNamespaceSelect from '../ModalConfirmWithNamespaceSelect';

// @ts-ignore
const {yaml} = languages || {};

const MonacoDiffContainer = styled.div<{height: string; width: string}>`
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

  const windowSize = useWindowSize();

  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const previewType = useAppSelector(state => state.main.previewType);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const kubeconfig = useAppSelector(state => state.config.kubeconfigPath);
  const kubeconfigContext = useAppSelector(state => state.config.kubeConfig.currentContext);
  const [shouldDiffIgnorePaths, setShouldDiffIgnorePaths] = useState<boolean>(true);

  const [containerRef, {height: containerHeight, width: containerWidth}] = useMeasure<HTMLDivElement>();

  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);

  useResourceYamlSchema(yaml, resourceMap, localResource.id);

  const options = {
    renderSideBySide: true,
    automaticLayoutResize: true,
    minimap: {
      enabled: false,
    },
    readOnly: true,
  };

  const confirmModalTitle = useMemo(
    () =>
      isKustomizationResource(localResource)
        ? `Deploy ${localResource.name} kustomization to cluster [${kubeconfigContext || ''}]?`
        : `Deploy ${localResource.name} to cluster [${kubeconfigContext || ''}]?`,
    [localResource, kubeconfigContext]
  );

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

  const monacoDiffContainerWidth = useMemo(() => {
    return (windowSize.width * 86.5) / 100 > 1000 ? '1000px' : '86.5vw';
  }, [windowSize.width]);

  const handleApply = () => {
    setIsApplyModalVisible(true);
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

  const onClickApplyResource = (namespace: string) => {
    if (onApply) {
      onApply();
    }

    applyResource(localResource.id, resourceMap, fileMap, dispatch, kubeconfig, kubeconfigContext || '', namespace, {
      isClusterPreview: previewType === 'cluster',
      shouldPerformDiff: true,
      isInClusterDiff,
    });
    setIsApplyModalVisible(false);
  };

  return (
    <>
      <MonacoDiffContainer width="100%" height="58vh" ref={containerRef}>
        <MonacoDiffEditor
          key={monacoDiffContainerWidth}
          language="yaml"
          original={localResourceText}
          value={cleanClusterResourceText}
          options={options}
          theme={KUBESHOP_MONACO_THEME}
          width={containerWidth}
          height={containerHeight}
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
          disabled={
            !shouldDiffIgnorePaths || !areResourcesDifferent || localResource.filePath.startsWith(PREVIEW_PREFIX)
          }
        >
          <ArrowLeftOutlined /> Replace local resource with cluster resource
        </Button>
        <StyledTag>Cluster</StyledTag>
      </TagsContainer>

      <SwitchContainer onClick={() => setShouldDiffIgnorePaths(!shouldDiffIgnorePaths)}>
        <Switch checked={shouldDiffIgnorePaths} />
        <StyledSwitchLabel>Hide ignored fields</StyledSwitchLabel>
      </SwitchContainer>

      {isApplyModalVisible && (
        <ModalConfirmWithNamespaceSelect
          isModalVisible={isApplyModalVisible}
          resources={[localResource]}
          title={confirmModalTitle}
          onOk={selectedNamespace => onClickApplyResource(selectedNamespace)}
          onCancel={() => setIsApplyModalVisible(false)}
        />
      )}
    </>
  );
};

export default ResourceDiff;
