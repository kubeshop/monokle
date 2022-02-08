import React, {LegacyRef, Suspense, useMemo} from 'react';
import {ResizableBox} from 'react-resizable';
import {useMeasure} from 'react-use';

import {MIN_SPLIT_VIEW_PANE_WIDTH} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setPaneConfiguration} from '@redux/reducers/ui';

import {NavigatorPane} from '@organisms';

import {useMainPaneHeight} from '@utils/hooks';

import * as S from './PaneManagerSplitView.styled';

const FileTreePane = React.lazy(() => import('@organisms/FileTreePane'));
const HelmPane = React.lazy(() => import('@organisms/HelmPane'));
const KustomizePane = React.lazy(() => import('@organisms/KustomizePane'));
const TemplateManagerPane = React.lazy(() => import('@organisms/TemplateManagerPane'));

const PaneManagerSplitView: React.FC = () => {
  const dispatch = useAppDispatch();
  const leftActive = useAppSelector(state => state.ui.leftMenu.isActive);
  const leftMenuSelection = useAppSelector(state => state.ui.leftMenu.selection);
  const leftWidth = useAppSelector(state => state.ui.paneConfiguration.leftWidth);
  const paneConfiguration = useAppSelector(state => state.ui.paneConfiguration);

  const paneHeight = useMainPaneHeight();

  const [leftPaneRef, {width: leftPaneWidth}] = useMeasure<HTMLDivElement>();
  const [splitViewContainerRef, {width: splitViewContainerWidth}] = useMeasure<HTMLDivElement>();

  const resizeLeftPane = () => {
    const newLeftWidthPercentage = leftPaneWidth / splitViewContainerWidth;

    if (newLeftWidthPercentage !== paneConfiguration.leftWidth) {
      dispatch(setPaneConfiguration({...paneConfiguration, leftWidth: newLeftWidthPercentage}));
    }
  };

  const splitViewGridTemplateColumns = useMemo(() => {
    let gridTemplateColumns = 'max-content 1fr';

    if (!leftActive) {
      gridTemplateColumns = '1fr';
    }

    return gridTemplateColumns;
  }, [leftActive]);

  return (
    <S.SplitViewContainer ref={splitViewContainerRef} $gridTemplateColumns={splitViewGridTemplateColumns}>
      {leftActive && leftMenuSelection && (
        <S.LeftPaneContainer ref={leftPaneRef}>
          <ResizableBox
            height={paneHeight}
            width={splitViewContainerWidth * leftWidth}
            minConstraints={[MIN_SPLIT_VIEW_PANE_WIDTH, paneHeight]}
            maxConstraints={[splitViewContainerWidth - MIN_SPLIT_VIEW_PANE_WIDTH, paneHeight]}
            onResizeStop={resizeLeftPane}
            axis="x"
            resizeHandles={['e']}
            handle={(h: number, ref: LegacyRef<HTMLSpanElement>) => <span className="custom-modal-handle" ref={ref} />}
          >
            <S.Pane id="LeftPane">
              <Suspense fallback={null}>
                {leftMenuSelection === 'file-explorer' && <FileTreePane />}
                {leftMenuSelection === 'helm-pane' && <HelmPane />}
                {leftMenuSelection === 'kustomize-pane' && <KustomizePane />}
                {leftMenuSelection === 'templates-pane' && <TemplateManagerPane />}
              </Suspense>
            </S.Pane>
          </ResizableBox>
        </S.LeftPaneContainer>
      )}

      <S.Pane id="NavPane" $height={paneHeight}>
        <NavigatorPane />
      </S.Pane>
    </S.SplitViewContainer>
  );
};

export default PaneManagerSplitView;
