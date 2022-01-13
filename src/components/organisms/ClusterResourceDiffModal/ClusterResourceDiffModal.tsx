import {LegacyRef, useEffect, useMemo, useState} from 'react';
import {MonacoDiffEditor} from 'react-monaco-editor';
import {ResizableBox} from 'react-resizable';
import {useMeasure, useWindowSize} from 'react-use';

import {Button, Select, Skeleton, Switch} from 'antd';

import {ArrowLeftOutlined, ArrowRightOutlined} from '@ant-design/icons';

import {stringify} from 'yaml';

import {CLUSTER_DIFF_PREFIX, PREVIEW_PREFIX} from '@constants/constants';

import {AlertEnum, AlertType} from '@models/alert';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {closeResourceDiffModal, updateResource} from '@redux/reducers/main';

import {KUBESHOP_MONACO_THEME} from '@utils/monaco';
import {removeIgnoredPathsFromResourceContent} from '@utils/resources';

import * as S from './styled';

const monacoEditorOptions = {
  readOnly: true,
  renderSideBySide: true,
  minimap: {
    enabled: false,
  },
};

const ClusterResourceDiffModal = () => {
  const dispatch = useAppDispatch();
  const isDiffModalVisible = useAppSelector(state => Boolean(state.main.resourceDiff.targetResourceId));
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const targetResource = useAppSelector(state =>
    state.main.resourceDiff.targetResourceId
      ? state.main.resourceMap[state.main.resourceDiff.targetResourceId]
      : undefined
  );

  const [containerRef, {height: containerHeight, width: containerWidth}] = useMeasure<HTMLDivElement>();

  const [hasDiffModalLoaded, setHasDiffModalLoaded] = useState(false);
  const [matchingResourceText, setMatchingResourceText] = useState<string>();
  const [selectedMatchingResourceId, setSelectedMatchingResourceId] = useState<string>();
  const [shouldDiffIgnorePaths, setShouldDiffIgnorePaths] = useState<boolean>(true);

  const windowSize = useWindowSize();

  const resizableBoxHeight = useMemo(() => windowSize.height * (75 / 100), [windowSize.height]);
  const resizableBoxWidth = useMemo(() => {
    const vwValue = windowSize.width < 1200 ? 95 : 80;
    return windowSize.width * (vwValue / 100);
  }, [windowSize.width]);

  const onCloseHandler = () => {
    setHasDiffModalLoaded(false);
    dispatch(closeResourceDiffModal());
  };

  const cleanTargetResourceText = useMemo(() => {
    if (!targetResource?.content) {
      return;
    }

    if (!shouldDiffIgnorePaths) {
      return stringify(targetResource.content, {sortMapEntries: true});
    }

    return stringify(removeIgnoredPathsFromResourceContent(targetResource.content, targetResource.namespace), {
      sortMapEntries: true,
    });
  }, [shouldDiffIgnorePaths, targetResource]);

  const areResourcesDifferent = useMemo(() => {
    return cleanTargetResourceText !== matchingResourceText;
  }, [cleanTargetResourceText, matchingResourceText]);

  const matchingLocalResources = useMemo(() => {
    if (!targetResource) {
      return;
    }

    return Object.fromEntries(
      Object.entries(resourceMap).filter(entry => {
        const value = entry[1];
        return (
          !value.filePath.startsWith(PREVIEW_PREFIX) &&
          !value.filePath.startsWith(CLUSTER_DIFF_PREFIX) &&
          value.name === targetResource.name
        );
      })
    );
  }, [resourceMap, targetResource]);

  const onFileSelectHandler = (resourceId: string) => {
    if (!matchingLocalResources) {
      return;
    }

    setSelectedMatchingResourceId(resourceId);
    setMatchingResourceText(stringify(matchingLocalResources[resourceId].content, {sortMapEntries: true}));
  };

  const handleReplace = () => {
    if (!shouldDiffIgnorePaths || !cleanTargetResourceText || !selectedMatchingResourceId) {
      return;
    }

    dispatch(
      updateResource({
        resourceId: selectedMatchingResourceId,
        content: cleanTargetResourceText,
        preventSelectionAndHighlightsUpdate: true,
        isInClusterMode: true,
      })
    );
  };

  useEffect(() => {
    if (!targetResource || !resourceMap || !matchingLocalResources) {
      return;
    }

    // matching resource was not found
    if (!Object.values(matchingLocalResources).length) {
      const alert: AlertType = {
        type: AlertEnum.Error,
        title: 'Diff failed',
        message: `Failed to retrieve ${targetResource.content.kind} ${targetResource.content.metadata.name} from local`,
      };

      dispatch(setAlert(alert));
      dispatch(closeResourceDiffModal());
      setHasDiffModalLoaded(false);
      return;
    }

    // set default selected matching resource
    const foundResourceWithNamespace = Object.values(matchingLocalResources).find(
      r => r.namespace && r.namespace === targetResource.namespace
    );

    if (foundResourceWithNamespace) {
      setSelectedMatchingResourceId(foundResourceWithNamespace.id);
      setMatchingResourceText(stringify(foundResourceWithNamespace.content, {sortMapEntries: true}));
    } else {
      setSelectedMatchingResourceId(Object.keys(matchingLocalResources)[0]);
      setMatchingResourceText(stringify(Object.values(matchingLocalResources)[0].content, {sortMapEntries: true}));
    }

    setHasDiffModalLoaded(true);
  }, [dispatch, matchingLocalResources, resourceMap, targetResource]);

  return (
    <S.StyledModal
      centered
      footer={null}
      title={
        <S.TitleContainer>
          Resource Diff on ${targetResource ? targetResource.name : ''}
          <S.FileSelectContainer>
            File:
            <Select
              value={selectedMatchingResourceId}
              onChange={(id: string) => onFileSelectHandler(id)}
              style={{width: '300px', marginLeft: '16px'}}
            >
              {matchingLocalResources &&
                Object.entries(matchingLocalResources).map(([key, value]) => (
                  <Select.Option key={key} value={key}>
                    {value.filePath}
                  </Select.Option>
                ))}
            </Select>
          </S.FileSelectContainer>
        </S.TitleContainer>
      }
      visible={isDiffModalVisible}
      width="min-width"
      onCancel={onCloseHandler}
    >
      <ResizableBox
        width={resizableBoxWidth}
        height={resizableBoxHeight}
        minConstraints={[800, resizableBoxHeight]}
        maxConstraints={[window.innerWidth - 64, resizableBoxHeight]}
        axis="x"
        resizeHandles={['w', 'e']}
        handle={(h: number, ref: LegacyRef<HTMLSpanElement>) => (
          <span className={`custom-modal-handle custom-modal-handle-${h}`} ref={ref} />
        )}
      >
        {!hasDiffModalLoaded ? (
          <div>
            <Skeleton active />
          </div>
        ) : (
          <>
            <S.MonacoDiffContainer width="100%" height="calc(100% - 140px)" ref={containerRef}>
              <MonacoDiffEditor
                width={containerWidth}
                height={containerHeight}
                language="yaml"
                original={cleanTargetResourceText}
                value={matchingResourceText}
                options={monacoEditorOptions}
                theme={KUBESHOP_MONACO_THEME}
              />
            </S.MonacoDiffContainer>

            <S.TagsContainer>
              <S.StyledTag>Cluster</S.StyledTag>
              <Button disabled={!areResourcesDifferent} ghost type="primary" onClick={handleReplace}>
                Replace local resource with cluster resource <ArrowRightOutlined />
              </Button>
              <Button type="primary" ghost disabled={!shouldDiffIgnorePaths || !areResourcesDifferent}>
                <ArrowLeftOutlined /> Deploy local resource to cluster
              </Button>
              <S.StyledTag>Local</S.StyledTag>
            </S.TagsContainer>

            <S.SwitchContainer onClick={() => setShouldDiffIgnorePaths(!shouldDiffIgnorePaths)}>
              <Switch checked={shouldDiffIgnorePaths} />
              <S.StyledSwitchLabel>Hide ignored fields</S.StyledSwitchLabel>
            </S.SwitchContainer>
          </>
        )}
      </ResizableBox>
    </S.StyledModal>
  );
};

export default ClusterResourceDiffModal;
