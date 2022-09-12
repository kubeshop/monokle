import React, {Suspense, useCallback, useMemo} from 'react';

import {
  DEFAULT_PANE_CONFIGURATION,
  GUTTER_SPLIT_VIEW_PANE_WIDTH,
  MIN_SPLIT_VIEW_PANE_WIDTH,
} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setPaneConfiguration} from '@redux/reducers/ui';

import {ActionsPane, NavigatorPane} from '@organisms';

import {useMainPaneDimensions} from '@utils/hooks';

import GitOpsView from '../GitOpsView';
import GitPane from '../GitPane';
import * as S from './PaneManagerSplitView.styled';
// eslint-disable-next-line import/no-relative-packages
import {ReflexContainer, ReflexElement, ReflexSplitter} from './react-reflex';

const FileTreePane = React.lazy(() => import('@organisms/FileTreePane'));
const HelmPane = React.lazy(() => import('@organisms/HelmPane'));
const ImagesPane = React.lazy(() => import('@components/organisms/ImagesPane'));
const KustomizePane = React.lazy(() => import('@organisms/KustomizePane'));
const TemplateManagerPane = React.lazy(() => import('@organisms/TemplateManagerPane'));
const ValidationPane = React.lazy(() => import('@organisms/ValidationPane'));
const SearchPane = React.lazy(() => import('@organisms/SearchPane'));

const PaneManagerSplitView: React.FC = () => {
  const dispatch = useAppDispatch();
  const bottomPaneHeight =
    useAppSelector(state => state.ui.paneConfiguration.bottomPaneHeight) || DEFAULT_PANE_CONFIGURATION.bottomPaneHeight;
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);
  const layout = useAppSelector(state => state.ui.paneConfiguration);
  const leftActiveMenu = useAppSelector(state =>
    state.ui.leftMenu.isActive ? state.ui.leftMenu.selection : undefined
  );
  const {height, width} = useMainPaneDimensions();

  const paneHeight = useMemo(
    () => (bottomSelection ? height - bottomPaneHeight - 2 : height),
    [bottomPaneHeight, bottomSelection, height]
  );

  const handleResize = useCallback(
    (elements: any) => {
      const updates = elements.reduce((obj: any, el: any) => {
        if (!['leftPane', 'navPane', 'editPane'].includes(el.props.id)) return obj;
        obj[el.props['id']] = el.props['flex'];
        return obj;
      }, {});

      const newLayout = {...layout, ...updates};
      dispatch(setPaneConfiguration(newLayout));
    },
    [dispatch, layout]
  );

  return (
    <ReflexContainer orientation="vertical" onStopResize={handleResize} windowResizeAware style={{width}}>
      {leftActiveMenu && (
        <ReflexElement id="leftPane" minSize={MIN_SPLIT_VIEW_PANE_WIDTH} flex={layout.leftPane}>
          <S.LeftPane>
            <Suspense fallback={<div />}>
              {leftActiveMenu === 'file-explorer' && <FileTreePane height={paneHeight} />}
              {leftActiveMenu === 'helm-pane' && <HelmPane />}
              {leftActiveMenu === 'git-pane' && <GitPane height={paneHeight} />}
              {leftActiveMenu === 'kustomize-pane' && <KustomizePane />}
              {leftActiveMenu === 'images-pane' && <ImagesPane />}
              {leftActiveMenu === 'templates-pane' && <TemplateManagerPane height={paneHeight} />}
              {leftActiveMenu === 'validation-pane' && <ValidationPane height={paneHeight} />}
              {leftActiveMenu === 'search' && <SearchPane height={paneHeight} />}
            </Suspense>
          </S.LeftPane>
        </ReflexElement>
      )}

      {/* react-reflex does not work as intended when you
            use fragments so keep this separate. */}
      {leftActiveMenu && <ReflexSplitter propagate style={{backgroundColor: '#191F21'}} />}

      {leftActiveMenu !== 'git-pane' && (
        <ReflexElement
          id="navPane"
          minSize={MIN_SPLIT_VIEW_PANE_WIDTH}
          maxSize={MIN_SPLIT_VIEW_PANE_WIDTH + 200}
          flex={layout.navPane}
        >
          <NavigatorPane height={paneHeight} />
        </ReflexElement>
      )}

      {/* react-reflex does not work as intended when you use propagate 
            without multiple splitters so set is dynamically. */}
      <ReflexSplitter propagate={Boolean(leftActiveMenu)} />

      {leftActiveMenu !== 'git-pane' && (
        <ReflexElement id="editPane" minSize={width < 1000 ? GUTTER_SPLIT_VIEW_PANE_WIDTH : MIN_SPLIT_VIEW_PANE_WIDTH}>
          <ActionsPane height={height} />
        </ReflexElement>
      )}

      {leftActiveMenu === 'git-pane' && (
        <ReflexElement id="editPane" minSize={width < 1000 ? GUTTER_SPLIT_VIEW_PANE_WIDTH : MIN_SPLIT_VIEW_PANE_WIDTH}>
          <GitOpsView />
        </ReflexElement>
      )}
    </ReflexContainer>
  );
};

export default PaneManagerSplitView;
