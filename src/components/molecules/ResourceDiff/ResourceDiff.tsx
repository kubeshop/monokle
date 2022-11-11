import {useMemo, useState} from 'react';
import {MonacoDiffEditor} from 'react-monaco-editor';
import {useMeasure} from 'react-use';

import {Button, Switch} from 'antd';

import {ArrowLeftOutlined, ArrowRightOutlined} from '@ant-design/icons';

import {languages} from 'monaco-editor/esm/vs/editor/editor.api';
import {parse, stringify} from 'yaml';

import {PREVIEW_PREFIX} from '@constants/constants';
import {makeApplyKustomizationText, makeApplyResourceText} from '@constants/makeApplyText';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {currentConfigSelector, kubeConfigContextColorSelector, kubeConfigContextSelector} from '@redux/selectors';
import {isKustomizationResource} from '@redux/services/kustomize';
import {applyResource} from '@redux/thunks/applyResource';
import {updateResource} from '@redux/thunks/updateResource';

import {Icon} from '@atoms';

import useResourceYamlSchema from '@hooks/useResourceYamlSchema';

import {useWindowSize} from '@utils/hooks';
import {KUBESHOP_MONACO_THEME} from '@utils/monaco';
import {removeIgnoredPathsFromResourceContent} from '@utils/resources';

import {K8sResource} from '@monokle-desktop/shared/models';

import ModalConfirmWithNamespaceSelect from '../ModalConfirmWithNamespaceSelect';
import * as S from './ResourceDiff.styled';

// @ts-ignore
const {yaml} = languages || {};

const options = {
  renderSideBySide: true,
  automaticLayoutResize: true,
  minimap: {
    enabled: false,
  },
  readOnly: true,
};

const ResourceDiff = (props: {localResource: K8sResource; clusterResourceText: string; onApply?: () => void}) => {
  const dispatch = useAppDispatch();
  const {localResource, clusterResourceText, onApply} = props;

  const fileMap = useAppSelector(state => state.main.fileMap);
  const k8sVersion = useAppSelector(state => state.config.projectConfig?.k8sVersion);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigContextColor = useAppSelector(kubeConfigContextColorSelector);
  const previewType = useAppSelector(state => state.main.previewType);
  const projectConfig = useAppSelector(currentConfigSelector);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const userDataDir = useAppSelector(state => state.config.userDataDir);

  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);
  const [shouldDiffIgnorePaths, setShouldDiffIgnorePaths] = useState<boolean>(true);

  const [containerRef, {height: containerHeight, width: containerWidth}] = useMeasure<HTMLDivElement>();

  const windowSize = useWindowSize();

  useResourceYamlSchema(yaml, String(userDataDir), String(k8sVersion), localResource);

  const confirmModalTitle = useMemo(
    () =>
      isKustomizationResource(localResource)
        ? makeApplyKustomizationText(localResource.name, kubeConfigContext, kubeConfigContextColor)
        : makeApplyResourceText(localResource.name, kubeConfigContext, kubeConfigContextColor),
    [localResource, kubeConfigContext, kubeConfigContextColor]
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
        text: cleanClusterResourceText,
        preventSelectionAndHighlightsUpdate: true,
      })
    );
  };

  const onClickApplyResource = (namespace?: {name: string; new: boolean}) => {
    if (onApply) {
      onApply();
    }

    applyResource(localResource.id, resourceMap, fileMap, dispatch, projectConfig, kubeConfigContext, namespace, {
      isClusterPreview: previewType === 'cluster',
      shouldPerformDiff: true,
    });
    setIsApplyModalVisible(false);
  };

  return (
    <>
      <S.MonacoDiffContainer ref={containerRef}>
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
      </S.MonacoDiffContainer>

      <S.TagsContainer>
        <S.Tag>Local</S.Tag>
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
        <S.Tag>Cluster</S.Tag>
      </S.TagsContainer>

      <S.SwitchContainer onClick={() => setShouldDiffIgnorePaths(!shouldDiffIgnorePaths)}>
        <Switch checked={shouldDiffIgnorePaths} />
        <S.SwitchLabel>Hide ignored fields</S.SwitchLabel>
      </S.SwitchContainer>

      {isApplyModalVisible && (
        <ModalConfirmWithNamespaceSelect
          isVisible={isApplyModalVisible}
          resources={[localResource]}
          title={confirmModalTitle}
          onOk={namespace => onClickApplyResource(namespace)}
          onCancel={() => setIsApplyModalVisible(false)}
        />
      )}
    </>
  );
};

export default ResourceDiff;
