import {useMemo, useState} from 'react';

import DefaultLayout from '@assets/DefaultLayout.svg';
import EditorLayout from '@assets/EditorLayout.svg';
import LayoutDark from '@assets/LayoutDark.svg';
import LayoutWhite from '@assets/LayoutWhite.svg';

import {TitleBar} from '@monokle/components';

import ValidationSettings from '../ValidationSettings';
import {CurrentProjectSettings} from './CurrentProjectSettings/CurrentProjectSettings';
import {DefaultProjectSettings} from './DefaultProjectSettings/DefaultProjectSettings';
import {GlobalSettings} from './GlobalSettings/GlobalSettings';
import {PluginManager} from './PluginsManager/PluginManager';
import * as S from './SettingsPane.styled';

export const SettingsPane = () => {
  const [activeTabKey, setActiveTabKey] = useState('validation');

  const tabItems = useMemo(
    () => [
      {
        key: 'validation',
        label: <S.TabOption>Validation</S.TabOption>,
        children: (
          <S.TabItemContainer>
            <ValidationSettings />
          </S.TabItemContainer>
        ),
      },
      {
        key: 'plugins-manager',
        label: <S.TabOption>Plugins Manager</S.TabOption>,
        children: (
          <S.TabItemContainer>
            <PluginManager />
          </S.TabItemContainer>
        ),
      },
      {
        key: 'current-project-settings',
        label: <S.TabOption>Current project settings</S.TabOption>,
        children: (
          <S.TabItemContainer>
            <CurrentProjectSettings />
          </S.TabItemContainer>
        ),
      },
      {
        key: 'default-project-settings',
        label: <S.TabOption>Default project settings</S.TabOption>,
        children: (
          <S.TabItemContainer>
            <DefaultProjectSettings />
          </S.TabItemContainer>
        ),
      },
      {
        key: 'global-settings',
        label: <S.TabOption>Global settings</S.TabOption>,
        children: (
          <S.TabItemContainer>
            <GlobalSettings />
          </S.TabItemContainer>
        ),
      },
    ],
    []
  );

  return (
    <S.SettingsPaneContainer>
      <TitleBar title="Configure your layout" description={<TitleCardDescription />} />

      <S.Tabs
        defaultActiveKey="source"
        activeKey={activeTabKey}
        items={tabItems}
        onChange={(k: string) => setActiveTabKey(k)}
      />
    </S.SettingsPaneContainer>
  );
};

export const TitleCardDescription = () => {
  const [selectedLayout, setSelectedLayout] = useState('EDITOR');
  const [selectedTheme, setSelectedTheme] = useState('DARK');

  return (
    <S.DescriptionContainer>
      <S.OptionsContainer>
        <S.LayoutOption
          $selected={selectedLayout === 'EDITOR'}
          onClick={() => {
            setSelectedLayout('EDITOR');
          }}
        >
          <S.LayoutContainer>
            <S.LayoutTitle>Editor Layout</S.LayoutTitle>
            <S.LayoutContent>Left pane collapses when editing so you can focus</S.LayoutContent>
          </S.LayoutContainer>
          <img src={EditorLayout} />
        </S.LayoutOption>

        <S.LayoutOption
          $selected={selectedLayout === 'DEFAULT'}
          onClick={() => {
            setSelectedLayout('DEFAULT');
          }}
        >
          <S.LayoutContainer>
            <S.LayoutTitle>Default Layout</S.LayoutTitle>
            <S.LayoutContent>You manually show/hide and move your panes</S.LayoutContent>
          </S.LayoutContainer>
          <img src={DefaultLayout} />
        </S.LayoutOption>
      </S.OptionsContainer>

      <S.OptionsContainer>
        <S.ThemeOption
          $selected={selectedTheme === 'DARK'}
          onClick={() => {
            setSelectedTheme('DARK');
          }}
        >
          <img src={LayoutDark} />
        </S.ThemeOption>

        <S.ThemeOption
          $selected={selectedTheme === 'LIGHT'}
          onClick={() => {
            setSelectedTheme('LIGHT');
          }}
        >
          <img src={LayoutWhite} />
        </S.ThemeOption>
      </S.OptionsContainer>
    </S.DescriptionContainer>
  );
};
