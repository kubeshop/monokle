import {useMemo, useRef, useState} from 'react';
import {MonacoDiffEditor} from 'react-monaco-editor';
import {useMeasure} from 'react-use';

import {Button, Switch} from 'antd';

import {ArrowLeftOutlined, ArrowRightOutlined} from '@ant-design/icons';

import {parse, stringify} from 'yaml';

import {makeApplyKustomizationText, makeApplyResourceText} from '@constants/makeApplyText';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {currentConfigSelector, isInClusterModeSelector, kubeConfigContextColorSelector} from '@redux/selectors';
import {useResourceMap} from '@redux/selectors/resourceMapSelectors';
import {isKustomizationResource} from '@redux/services/kustomize';
import {applyResource} from '@redux/thunks/applyResource';
import {updateResource} from '@redux/thunks/updateResource';

import useResourceYamlSchema from '@hooks/useResourceYamlSchema';

import {useWindowSize} from '@utils/hooks';
import {KUBESHOP_MONACO_THEME} from '@utils/monaco';
import {removeIgnoredPathsFromResourceObject} from '@utils/resources';

import {Icon} from '@monokle/components';
import {K8sResource} from '@shared/models/k8sResource';
import {kubeConfigContextSelector} from '@shared/utils/selectors';

import ModalConfirmWithNamespaceSelect from '../ModalConfirmWithNamespaceSelect';
import * as S from './ResourceDiff.styled';

const options = {
  renderSideBySide: true,
  automaticLayoutResize: true,
  minimap: {
    enabled: false,
  },
  readOnly: true,
};

// TODO: this component will need some refactoring, we should find a way to avoid getting an entire resourceMap
const ResourceDiff = (props: {
  localResource: K8sResource<'local'>;
  clusterResourceText: string;
  onApply?: () => void;
}) => {
  const dispatch = useAppDispatch();
  const {localResource, clusterResourceText, onApply} = props;

  const localResourceRef = useRef(localResource);
  localResourceRef.current = localResource;

  const fileMap = useAppSelector(state => state.main.fileMap);
  const k8sVersion = useAppSelector(state => state.config.projectConfig?.k8sVersion);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigContextColor = useAppSelector(kubeConfigContextColorSelector);
  const projectConfig = useAppSelector(currentConfigSelector);
  const localResourceMap = useResourceMap('local');
  const userDataDir = useAppSelector(state => state.config.userDataDir);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);

  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);
  const [shouldDiffIgnorePaths, setShouldDiffIgnorePaths] = useState<boolean>(true);

  const [containerRef, {height: containerHeight, width: containerWidth}] = useMeasure<HTMLDivElement>();

  const windowSize = useWindowSize();

  useResourceYamlSchema(String(userDataDir), String(k8sVersion), localResource.id, localResourceRef);

  const confirmModalTitle = useMemo(
    () =>
      isKustomizationResource(localResource)
        ? makeApplyKustomizationText(localResource.name, kubeConfigContext, kubeConfigContextColor)
        : makeApplyResourceText(localResource.name, kubeConfigContext, kubeConfigContextColor),
    [localResource, kubeConfigContext, kubeConfigContextColor]
  );

  // TODO: can't we just use localResource.text here?
  const localResourceText = useMemo(() => {
    return stringify(localResource.object, {sortMapEntries: true});
  }, [localResource]);

  const cleanClusterResourceText = useMemo(() => {
    if (!shouldDiffIgnorePaths) {
      return clusterResourceText;
    }
    const originalClusterResourceContent = parse(clusterResourceText);
    const cleanClusterResourceContent = removeIgnoredPathsFromResourceObject(originalClusterResourceContent);

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
        resourceIdentifier: localResource,
        text: cleanClusterResourceText,
        preventSelectionAndHighlightsUpdate: true,
      })
    );
  };

  const onClickApplyResource = (namespace?: {name: string; new: boolean}) => {
    if (onApply) {
      onApply();
    }

    applyResource(localResource.id, localResourceMap, fileMap, dispatch, projectConfig, kubeConfigContext, namespace, {
      isInClusterMode,
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
          disabled={!shouldDiffIgnorePaths || !areResourcesDifferent || localResource.storage !== 'local'}
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
          resourceMetaList={[localResource]}
          title={confirmModalTitle}
          onOk={namespace => onClickApplyResource(namespace)}
          onCancel={() => setIsApplyModalVisible(false)}
        />
      )}
    </>
  );
};

export default ResourceDiff;
