import {useCallback, useMemo} from 'react';

import {Dropdown, Tooltip} from 'antd';

import {TOOLTIP_DELAY} from '@constants/constants';
import {
  CollapseResourcesTooltip,
  DisabledAddResourceTooltip,
  ExpandResourcesTooltip,
  NewResourceTooltip,
} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {collapseResourceKinds, expandResourceKinds} from '@redux/reducers/ui';
import {activeResourceCountSelector, navigatorResourceKindsSelector} from '@redux/selectors/resourceMapSelectors';

import {TitleBarWrapper} from '@components/atoms';
import {CollapseIcon, ExpandIcon} from '@components/atoms/Icons';

import {useNewResourceMenuItems} from '@hooks/menuItemsHooks';

import {useSelectorWithRef} from '@utils/hooks';

import {TitleBar} from '@monokle/components';
import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {isInClusterModeSelector, isInPreviewModeSelector, trackEvent} from '@shared/utils';

import NavigatorDescription from './NavigatorDescription';

import * as S from './styled';

export const ResourceTitleBar = () => {
  const isFolderOpen = useAppSelector(state => Boolean(state.main.fileMap[ROOT_FILE_ENTRY]));
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);

  const newResourceMenuItems = useNewResourceMenuItems();

  const isAddResourceDisabled = useMemo(
    () => !isFolderOpen || isInPreviewMode || isInClusterMode,
    [isFolderOpen, isInClusterMode, isInPreviewMode]
  );
  return (
    <TitleBarWrapper $navigator>
      <TitleBar
        type="secondary"
        title="Kubernetes Resources"
        description={<NavigatorDescription />}
        descriptionStyle={{paddingTop: '5px'}}
        actions={
          <S.TitleBarRightButtons>
            <CollapseAction />

            <Dropdown
              trigger={['click']}
              menu={{items: newResourceMenuItems}}
              overlayClassName="dropdown-secondary"
              disabled={isAddResourceDisabled}
            >
              <Tooltip
                mouseEnterDelay={TOOLTIP_DELAY}
                title={
                  isAddResourceDisabled
                    ? DisabledAddResourceTooltip({
                        type: isInClusterMode ? 'cluster' : isInPreviewMode ? 'preview' : 'other',
                      })
                    : NewResourceTooltip
                }
              >
                <S.NewButton id="create-resource-button" disabled={isAddResourceDisabled} size="small" type="primary">
                  New
                </S.NewButton>
              </Tooltip>
            </Dropdown>
          </S.TitleBarRightButtons>
        }
      />
    </TitleBarWrapper>
  );
};

function CollapseAction() {
  const dispatch = useAppDispatch();
  const [hasAnyActiveResources, hasAnyActiveResourcesRef] = useSelectorWithRef(
    state => activeResourceCountSelector(state) > 0
  );

  const [collapsedKinds, collapsedKindsRef] = useSelectorWithRef(s => s.ui.navigator.collapsedResourceKinds);
  const [navigatorKinds, navigatorKindsRef] = useSelectorWithRef(navigatorResourceKindsSelector);

  const isCollapsed = useMemo(
    () => collapsedKinds.length === navigatorKinds.length,
    [collapsedKinds.length, navigatorKinds.length]
  );

  const onClick = useCallback(() => {
    if (!hasAnyActiveResourcesRef.current) {
      return;
    }

    if (collapsedKindsRef.current.length === navigatorKindsRef.current.length) {
      dispatch(expandResourceKinds(navigatorKindsRef.current));
      trackEvent('navigator/expand_all');
      return;
    }

    dispatch(collapseResourceKinds(navigatorKindsRef.current));
    trackEvent('navigator/collapse_all');
  }, [hasAnyActiveResourcesRef, collapsedKindsRef, navigatorKindsRef, dispatch]);

  return (
    <>
      <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={isCollapsed ? ExpandResourcesTooltip : CollapseResourcesTooltip}>
        {isCollapsed ? (
          <S.FullscreenOutlined component={ExpandIcon} onClick={onClick} $disabled={!hasAnyActiveResources} />
        ) : (
          <S.FullscreenExitOutlined component={CollapseIcon} onClick={onClick} $disabled={!hasAnyActiveResources} />
        )}
      </Tooltip>
    </>
  );
}
