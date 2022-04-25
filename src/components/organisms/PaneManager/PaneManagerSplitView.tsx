import React, {LegacyRef, Suspense, useCallback, useEffect, useMemo} from 'react';
import {ResizableBox} from 'react-resizable';
import {useMeasure} from 'react-use';

import {MIN_SPLIT_VIEW_PANE_WIDTH} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setPaneConfiguration} from '@redux/reducers/ui';

import {ActionsPane, NavigatorPane} from '@organisms';

import {GraphView} from '@components/molecules';

import {useMainPaneHeight} from '@utils/hooks';

import featureJson from '@src/feature-flags.json';

import ValidationPane from '../ValidationDrawer';
import * as S from './PaneManagerSplitView.styled';

const FileTreePane = React.lazy(() => import('@organisms/FileTreePane'));
const HelmPane = React.lazy(() => import('@organisms/HelmPane'));
const KustomizePane = React.lazy(() => import('@organisms/KustomizePane'));
const TemplateManagerPane = React.lazy(() => import('@organisms/TemplateManagerPane'));

const PaneManagerSplitView: React.FC = () => {
  const dispatch = useAppDispatch();
  const editWidth = useAppSelector(state => state.ui.paneConfiguration.editWidth);
  const leftActive = useAppSelector(state => state.ui.leftMenu.isActive);
  const leftMenuSelection = useAppSelector(state => state.ui.leftMenu.selection);
  const leftWidth = useAppSelector(state => state.ui.paneConfiguration.leftWidth);
  const navWidth = useAppSelector(state => state.ui.paneConfiguration.navWidth);
  const paneConfiguration = useAppSelector(state => state.ui.paneConfiguration);
  const rightActive = useAppSelector(state => state.ui.rightMenu.isActive);
  const rightMenuSelection = useAppSelector(state => state.ui.rightMenu.selection);

  const paneHeight = useMainPaneHeight();

  const [editPaneRef, {width: editPaneWidth}] = useMeasure<HTMLDivElement>();
  const [leftPaneRef, {width: leftPaneWidth}] = useMeasure<HTMLDivElement>();
  const [navPaneRef, {width: navPaneWidth}] = useMeasure<HTMLDivElement>();
  const [splitViewContainerRef, {width: splitViewContainerWidth}] = useMeasure<HTMLDivElement>();

  const leftPaneMaxWidth = useMemo(() => {
    return splitViewContainerWidth - MIN_SPLIT_VIEW_PANE_WIDTH - editPaneWidth;
  }, [editPaneWidth, splitViewContainerWidth]);

  const editPaneMaxWidth = useMemo(() => {
    let maxWidth = splitViewContainerWidth - MIN_SPLIT_VIEW_PANE_WIDTH;

    if (leftActive) {
      maxWidth -= leftPaneWidth;
    }

    return maxWidth;
  }, [leftActive, leftPaneWidth, splitViewContainerWidth]);

  const resizeLeftPane = useCallback(() => {
    const newLeftWidthPercentage = leftPaneWidth / splitViewContainerWidth;

    if (newLeftWidthPercentage !== paneConfiguration.leftWidth) {
      dispatch(setPaneConfiguration({...paneConfiguration, leftWidth: newLeftWidthPercentage}));
    }
  }, [dispatch, leftPaneWidth, paneConfiguration, splitViewContainerWidth]);

  const resizeEditPane = useCallback(() => {
    const newEditPaneWidthPercentage = editPaneWidth / splitViewContainerWidth;

    if (newEditPaneWidthPercentage !== paneConfiguration.editWidth) {
      dispatch(setPaneConfiguration({...paneConfiguration, editWidth: newEditPaneWidthPercentage}));
    }
  }, [dispatch, editPaneWidth, paneConfiguration, splitViewContainerWidth]);

  const splitViewGridTemplateColumns = useMemo(() => {
    let gridTemplateColumns = 'max-content 1fr max-content';

    if (!leftActive) {
      gridTemplateColumns = '1fr max-content';
    }

    return gridTemplateColumns;
  }, [leftActive]);

  useEffect(() => {
    if (leftActive && splitViewContainerWidth * (navWidth + leftWidth + editWidth) > splitViewContainerWidth) {
      const newEditPaneWidthPercentage = 1 - leftWidth - navWidth;

      dispatch(setPaneConfiguration({...paneConfiguration, editWidth: newEditPaneWidthPercentage}));
    }

    if (!leftActive && navPaneWidth && splitViewContainerWidth) {
      dispatch(
        setPaneConfiguration({
          ...paneConfiguration,
          navWidth: navPaneWidth / (splitViewContainerWidth || 1.0),
        })
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftActive]);

  return (
    <S.SplitViewContainer>
      <ValidationPane height={paneHeight} />

      <S.SplitViewGrid ref={splitViewContainerRef as any} $gridTemplateColumns={splitViewGridTemplateColumns}>
        {leftActive && leftMenuSelection && (
          <S.LeftPaneContainer ref={leftPaneRef}>
            <ResizableBox
              height={paneHeight}
              width={splitViewContainerWidth * leftWidth}
              minConstraints={[MIN_SPLIT_VIEW_PANE_WIDTH, paneHeight]}
              maxConstraints={[leftPaneMaxWidth, paneHeight]}
              axis="x"
              resizeHandles={['e']}
              handle={(h: number, ref: LegacyRef<HTMLSpanElement>) => (
                <span className="custom-modal-handle" ref={ref} />
              )}
              onResizeStop={resizeLeftPane}
            >
              <S.Pane id="LeftPane">
                <Suspense fallback={null}>
                  {leftMenuSelection === 'file-explorer' && <FileTreePane />}
                  {leftMenuSelection === 'helm-pane' && <HelmPane />}
                  {leftMenuSelection === 'kustomize-pane' && <KustomizePane />}
                  {leftMenuSelection === 'templates-pane' && <TemplateManagerPane contentHeight={paneHeight} />}
                </Suspense>
              </S.Pane>
            </ResizableBox>
          </S.LeftPaneContainer>
        )}

        <S.Pane id="NavPane" $height={paneHeight} ref={navPaneRef}>
          <NavigatorPane />
        </S.Pane>

        <S.EditorPaneContainer ref={editPaneRef}>
          <ResizableBox
            height={paneHeight}
            width={splitViewContainerWidth * editWidth}
            minConstraints={[MIN_SPLIT_VIEW_PANE_WIDTH, paneHeight]}
            maxConstraints={[editPaneMaxWidth, paneHeight]}
            axis="x"
            resizeHandles={['w']}
            handle={(h: number, ref: LegacyRef<HTMLSpanElement>) => <span className="custom-modal-handle" ref={ref} />}
            onResizeStop={resizeEditPane}
          >
            <S.Pane id="EditorPane" $height={paneHeight}>
              <ActionsPane contentHeight={paneHeight} />
            </S.Pane>
          </ResizableBox>
        </S.EditorPaneContainer>

        {featureJson.ShowGraphView && rightMenuSelection === 'graph' && rightActive && (
          <S.Pane id="RightPane" $height={paneHeight}>
            <GraphView editorHeight={paneHeight} />
          </S.Pane>
        )}
      </S.SplitViewGrid>
    </S.SplitViewContainer>
  );
};

export default PaneManagerSplitView;
