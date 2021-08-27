import React, {useCallback, useEffect, useState, useRef} from 'react';
import {Tabs, Col, Row, Button, Tooltip, Menu, Dropdown} from 'antd';
import {CodeOutlined, ContainerOutlined, ArrowLeftOutlined, ArrowRightOutlined} from '@ant-design/icons';

import Monaco from '@molecules/Monaco';
import FormEditor from '@molecules/FormEditor';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import TabHeader from '@atoms/TabHeader';
import {MonoPaneTitle, MonoPaneTitleCol} from '@atoms';
import {K8sResource} from '@models/k8sresource';
import {ApplyFileTooltip, ApplyTooltip, DiffTooltip, SaveUnsavedResourceTooltip} from '@constants/tooltips';
import {performResourceDiff} from '@redux/thunks/diffResource';
import {selectFromHistory} from '@redux/thunks/selectionHistory';
import {TOOLTIP_DELAY} from '@constants/constants';
import {saveUnsavedResource} from '@redux/thunks/saveUnsavedResource';
import {isUnsavedResource} from '@redux/services/resource';
import {useFileExplorer, OnSelectDirectory, OnSelectSingleFile} from '@hooks/useFileExplorer';
import {applyFileWithConfirm} from './applyFileWithConfirm';
import {applyResourceWithConfirm} from './applyResourceWithConfirm';
import {
  StyledLeftArrowButton,
  StyledRightArrowButton,
  StyledSkeleton,
  StyledTabs,
  TitleBarContainer,
  DiffButton,
  SaveButton,
  RightButtons,
  ActionsPaneContainer,
} from './ActionsPane.styled';

const {TabPane} = Tabs;

const ActionsPane = (props: {contentHeight: string}) => {
  const {contentHeight} = props;

  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const applyingResource = useAppSelector(state => state.main.isApplyingResource);
  const [selectedResource, setSelectedResource] = useState<K8sResource>();
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const kubeconfig = useAppSelector(state => state.config.kubeconfigPath);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const uiState = useAppSelector(state => state.ui);
  const currentSelectionHistoryIndex = useAppSelector(state => state.main.currentSelectionHistoryIndex);
  const selectionHistory = useAppSelector(state => state.main.selectionHistory);
  const fileExplorerTypeRef = useRef<'directory' | 'single-file'>('single-file');
  const [key, setKey] = useState('source');
  const dispatch = useAppDispatch();

  const {openFileExplorer, FileExplorer} = useFileExplorer({
    type: fileExplorerTypeRef.current,
    onSelect: (result: OnSelectDirectory | OnSelectSingleFile) => {
      if (!selectedResourceId) {
        return;
      }
      dispatch(
        saveUnsavedResource({
          resourceId: selectedResourceId,
          absolutePath: result.absolutePath,
        })
      );
    },
    acceptedFileExtensions: fileExplorerTypeRef.current === 'single-file' ? ['.yaml'] : undefined,
  });

  const onSaveToFile = () => {
    fileExplorerTypeRef.current = 'single-file';
    openFileExplorer();
  };

  const onSaveToDirectory = () => {
    fileExplorerTypeRef.current = 'directory';
    openFileExplorer();
  };

  const getSaveButtonMenu = useCallback(
    () => (
      <Menu>
        <Menu.Item key="to-existing-file">
          <Button onClick={onSaveToFile} type="text">
            To existing file
          </Button>
        </Menu.Item>
        <Menu.Item key="to-directory">
          <Button onClick={onSaveToDirectory} type="text">
            To new file in directory
          </Button>
        </Menu.Item>
      </Menu>
    ),
    [onSaveToFile, onSaveToDirectory]
  );

  const isLeftArrowEnabled =
    selectionHistory.length > 1 &&
    (currentSelectionHistoryIndex === undefined || (currentSelectionHistoryIndex && currentSelectionHistoryIndex > 0));
  const isRightArrowEnabled =
    selectionHistory.length > 1 &&
    currentSelectionHistoryIndex !== undefined &&
    currentSelectionHistoryIndex < selectionHistory.length - 1;

  const onClickLeftArrow = () => {
    dispatch(selectFromHistory({direction: 'left'}));
  };

  const onClickRightArrow = () => {
    dispatch(selectFromHistory({direction: 'right'}));
  };

  const applySelection = useCallback(() => {
    if (selectedResource) {
      applyResourceWithConfirm(selectedResource, resourceMap, fileMap, dispatch, kubeconfig);
    } else if (selectedPath) {
      applyFileWithConfirm(selectedPath, fileMap, dispatch, kubeconfig);
    }
  }, [selectedResource, resourceMap, fileMap, kubeconfig, selectedPath]);

  const diffSelectedResource = useCallback(() => {
    if (selectedResourceId) {
      dispatch(performResourceDiff(selectedResourceId));
    }
  }, [selectedResourceId]);

  useEffect(() => {
    if (selectedResourceId && resourceMap[selectedResourceId]) {
      setSelectedResource(resourceMap[selectedResourceId]);
    } else {
      setSelectedResource(undefined);
    }
  }, [selectedResourceId, resourceMap]);

  useEffect(() => {
    if (key === 'form' && (!selectedResourceId || selectedResource?.kind !== 'ConfigMap')) {
      setKey('source');
    }
  }, [selectedResourceId, selectedResource, key]);

  const isSelectedResourceUnsaved = useCallback(() => {
    if (!selectedResource) {
      return false;
    }
    return isUnsavedResource(selectedResource);
  }, [selectedResource]);

  return (
    <>
      <Row>
        <FileExplorer />
        <MonoPaneTitleCol>
          <MonoPaneTitle>
            <TitleBarContainer>
              <span>Editor</span>
              <RightButtons>
                <StyledLeftArrowButton
                  onClick={onClickLeftArrow}
                  disabled={!isLeftArrowEnabled}
                  type="link"
                  size="small"
                  icon={<ArrowLeftOutlined />}
                />
                <StyledRightArrowButton
                  onClick={onClickRightArrow}
                  disabled={!isRightArrowEnabled}
                  type="link"
                  size="small"
                  icon={<ArrowRightOutlined />}
                />

                {isSelectedResourceUnsaved() && (
                  <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={SaveUnsavedResourceTooltip}>
                    <Dropdown overlay={getSaveButtonMenu()}>
                      <SaveButton type="primary" size="small">
                        Save
                      </SaveButton>
                    </Dropdown>
                  </Tooltip>
                )}

                <Tooltip
                  mouseEnterDelay={TOOLTIP_DELAY}
                  title={selectedPath ? ApplyFileTooltip : ApplyTooltip}
                  placement="bottomLeft"
                >
                  <Button
                    loading={Boolean(applyingResource)}
                    type="primary"
                    size="small"
                    ghost
                    onClick={applySelection}
                    disabled={!selectedResourceId && !selectedPath}
                  >
                    Apply
                  </Button>
                </Tooltip>
                <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={DiffTooltip} placement="bottomLeft">
                  <DiffButton
                    size="small"
                    type="primary"
                    ghost
                    onClick={diffSelectedResource}
                    disabled={!selectedResourceId}
                  >
                    Diff
                  </DiffButton>
                </Tooltip>
              </RightButtons>
            </TitleBarContainer>
          </MonoPaneTitle>
        </MonoPaneTitleCol>
      </Row>

      <ActionsPaneContainer>
        <Row>
          <Col span={24}>
            <StyledTabs defaultActiveKey="source" activeKey={key} onChange={k => setKey(k)}>
              <TabPane tab={<TabHeader icon={<CodeOutlined />}>Source</TabHeader>} key="source">
                {uiState.isFolderLoading || previewLoader.isLoading ? (
                  <StyledSkeleton active />
                ) : (
                  <Monaco editorHeight={`${parseInt(contentHeight, 10) - 120}`} />
                )}
              </TabPane>
              {selectedResource && selectedResource?.kind === 'ConfigMap' && (
                <TabPane
                  tab={<TabHeader icon={<ContainerOutlined />}>Form</TabHeader>}
                  disabled={!selectedResourceId}
                  key="form"
                >
                  {uiState.isFolderLoading || previewLoader.isLoading ? (
                    <StyledSkeleton active />
                  ) : (
                    <FormEditor contentHeight={contentHeight} />
                  )}
                </TabPane>
              )}
            </StyledTabs>
          </Col>
        </Row>
      </ActionsPaneContainer>
    </>
  );
};

export default ActionsPane;
