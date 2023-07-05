import {useMemo} from 'react';

import {activeProjectSelector} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setActiveSettingsPanel} from '@redux/reducers/ui';

import {TitleBarWrapper} from '@components/atoms';

import {TitleBar} from '@monokle/components';
import {SettingsPanel} from '@shared/models/config';

import ValidationSettings from '../ValidationSettings';
import {CurrentProjectSettings} from './CurrentProjectSettings/CurrentProjectSettings';
import {DefaultProjectSettings} from './DefaultProjectSettings/DefaultProjectSettings';
import {GlobalSettings} from './GlobalSettings/GlobalSettings';
import {PluginManager} from './PluginsManager/PluginManager';
import * as S from './SettingsPane.styled';

const SettingsPane = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const activeSettingsPanel = useAppSelector(state => state.ui.activeSettingsPanel);
  const isInQuickClusterMode = useAppSelector(state => Boolean(state.ui.isInQuickClusterMode));
  const isStartProjectPaneVisible = useAppSelector(state => state.ui.isStartProjectPaneVisible);

  const isOnStartProjectPage = useMemo(
    () => !activeProject || isStartProjectPaneVisible,
    [activeProject, isStartProjectPaneVisible]
  );

  const tabItems = useMemo(
    () => [
      ...((activeProject && !isStartProjectPaneVisible) || isInQuickClusterMode
        ? [
            {
              key: 'validation',
              label: <S.TabOption>Validation</S.TabOption>,
              children: (
                <S.TabItemContainer $isOnStartProjectPage={isOnStartProjectPage} id="validation-settings-tab">
                  <ValidationSettings />
                </S.TabItemContainer>
              ),
            },
          ]
        : []),

      ...(activeProject && !isStartProjectPaneVisible
        ? [
            {
              key: 'current-project-settings',
              label: <S.TabOption>Current project settings</S.TabOption>,
              children: (
                <S.TabItemContainer $isOnStartProjectPage={isOnStartProjectPage}>
                  <CurrentProjectSettings />
                </S.TabItemContainer>
              ),
            },
          ]
        : []),

      ...((!activeProject || isStartProjectPaneVisible) && !isInQuickClusterMode
        ? [
            {
              key: 'global-settings',
              label: <S.TabOption>Global settings</S.TabOption>,
              children: (
                <S.TabItemContainer $isOnStartProjectPage={isOnStartProjectPage}>
                  <GlobalSettings />
                </S.TabItemContainer>
              ),
            },
            {
              key: 'plugins-manager',
              label: <S.TabOption>Plugins Manager</S.TabOption>,
              children: (
                <S.TabItemContainer $isOnStartProjectPage={isOnStartProjectPage}>
                  <PluginManager />
                </S.TabItemContainer>
              ),
            },
          ]
        : []),

      ...(!activeProject || isStartProjectPaneVisible
        ? [
            {
              key: 'default-project-settings',
              label: <S.TabOption>Default project settings</S.TabOption>,
              children: (
                <S.TabItemContainer $isOnStartProjectPage={isOnStartProjectPage}>
                  <DefaultProjectSettings />
                </S.TabItemContainer>
              ),
            },
          ]
        : []),
    ],
    [activeProject, isInQuickClusterMode, isOnStartProjectPage, isStartProjectPaneVisible]
  );

  return (
    <S.SettingsPaneContainer
      $isOnStartProjectPage={isOnStartProjectPage}
      $isInQuickClusterMode={isInQuickClusterMode && !activeProject}
    >
      {!isOnStartProjectPage && (
        <TitleBarWrapper>
          <TitleBar title="Project settings" />
        </TitleBarWrapper>
      )}

      <S.Tabs
        $isOnStartProjectPage={isOnStartProjectPage}
        activeKey={activeSettingsPanel}
        items={tabItems}
        onChange={(k: string) => dispatch(setActiveSettingsPanel(k as SettingsPanel))}
      />
    </S.SettingsPaneContainer>
  );
};

export default SettingsPane;
