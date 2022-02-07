import React, {Suspense} from 'react';

import {useAppSelector} from '@redux/hooks';

import {useMainPaneHeight} from '@utils/hooks';

// import {NavigatorPane} from '@organisms';
import * as S from './PaneManagerSplitView.styled';

const FileTreePane = React.lazy(() => import('@organisms/FileTreePane'));
const HelmPane = React.lazy(() => import('@organisms/HelmPane'));
const KustomizePane = React.lazy(() => import('@organisms/KustomizePane'));
const TemplateManagerPane = React.lazy(() => import('@organisms/TemplateManagerPane'));

const PaneManagerSplitView: React.FC = () => {
  const leftActive = useAppSelector(state => state.ui.leftMenu.isActive);
  const leftMenuSelection = useAppSelector(state => state.ui.leftMenu.selection);
  const leftWidth = useAppSelector(state => state.ui.paneConfiguration.leftWidth);

  const paneHeight = useMainPaneHeight();

  return (
    <S.SplitViewContainer>
      {leftActive && leftMenuSelection && (
        <Suspense fallback={null}>
          <S.LeftPane id="LeftPane" $width={500 || leftWidth} $height={paneHeight}>
            {leftMenuSelection === 'file-explorer' && <FileTreePane />}
            {leftMenuSelection === 'helm-pane' && <HelmPane />}
            {leftMenuSelection === 'kustomize-pane' && <KustomizePane />}
            {leftMenuSelection === 'templates-pane' && <TemplateManagerPane />}
          </S.LeftPane>
        </Suspense>
      )}

      {/* <S.NavPane id="NavPane">
        <NavigatorPane />
      </S.NavPane> */}
    </S.SplitViewContainer>
  );
};

export default PaneManagerSplitView;
