import React, {Suspense, useCallback} from 'react';
import {ReflexContainer, ReflexElement, ReflexSplitter} from 'react-reflex';

import {GUT_SPLIT_VIEW_PANE_WIDTH, MIN_SPLIT_VIEW_PANE_WIDTH} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setPaneConfiguration} from '@redux/reducers/ui';

import {ActionsPane, NavigatorPane} from '@organisms';

import {useMainPaneHeight} from '@utils/hooks';

import ValidationPane from '../ValidationDrawer';
import * as S from './PaneManagerSplitView.styled';

const FileTreePane = React.lazy(() => import('@organisms/FileTreePane'));
const HelmPane = React.lazy(() => import('@organisms/HelmPane'));
const KustomizePane = React.lazy(() => import('@organisms/KustomizePane'));
const TemplateManagerPane = React.lazy(() => import('@organisms/TemplateManagerPane'));

const PaneManagerSplitView: React.FC = () => {
  const dispatch = useAppDispatch();
  const layout = useAppSelector(store => store.ui.paneConfiguration);
  const leftActive = useAppSelector(state => state.ui.leftMenu.isActive);
  const leftMenuSelection = useAppSelector(state => state.ui.leftMenu.selection);

  const paneHeight = useMainPaneHeight();

  const handleResize = useCallback(
    elements => {
      const updates = elements.reduce((obj: any, el: any) => {
        if (!['leftPane', 'navPane'].includes(el.props.id)) return obj;
        obj[el.props['id']] = el.props['flex'];
        return obj;
      }, {});

      const newLayout = {...layout, ...updates};
      dispatch(setPaneConfiguration(newLayout));
    },
    [dispatch, layout]
  );

  return (
    <S.SplitViewContainer>
      <ValidationPane height={paneHeight} />

      <ReflexContainer orientation="vertical" onStopResize={handleResize} windowResizeAware>
        {leftActive && leftMenuSelection && (
          <ReflexElement id="leftPane" minSize={MIN_SPLIT_VIEW_PANE_WIDTH} flex={layout.leftPane}>
            <S.LeftPane>
              <Suspense fallback={<div />}>
                {leftMenuSelection === 'file-explorer' && <FileTreePane />}
                {leftMenuSelection === 'helm-pane' && <HelmPane />}
                {leftMenuSelection === 'kustomize-pane' && <KustomizePane />}
                {leftMenuSelection === 'templates-pane' && <TemplateManagerPane contentHeight={paneHeight} />}
              </Suspense>
            </S.LeftPane>
          </ReflexElement>
        )}

        {leftActive && leftMenuSelection && <ReflexSplitter propagate />}

        <ReflexElement
          id="navPane"
          minSize={MIN_SPLIT_VIEW_PANE_WIDTH}
          maxSize={MIN_SPLIT_VIEW_PANE_WIDTH + 75}
          flex={layout.navPane}
        >
          <NavigatorPane />
        </ReflexElement>

        <ReflexSplitter propagate={leftActive && leftMenuSelection !== undefined} />

        <ReflexElement id="editPane" minSize={GUT_SPLIT_VIEW_PANE_WIDTH}>
          <ActionsPane />
        </ReflexElement>
      </ReflexContainer>
    </S.SplitViewContainer>
  );
};

export default PaneManagerSplitView;
