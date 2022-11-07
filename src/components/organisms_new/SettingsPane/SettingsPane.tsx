import {useMemo, useState} from 'react';

import {StepEnum} from '@models/walkthrough';

import {useAppDispatch} from '@redux/hooks';
import {cancelWalkthrough, handleWalkthroughStep} from '@redux/reducers/ui';

import {TabHeader} from '@atoms';

import {usePaneHeight} from '@hooks/usePaneHeight';

import CurlyArrow from '@assets/CurlyArrow.svg';
import DefaultLayout from '@assets/DefaultLayout.svg';
import EditorLayout from '@assets/EditorLayout.svg';
import LayoutDark from '@assets/LayoutDark.svg';
import LayoutWhite from '@assets/LayoutWhite.svg';

import {TitleBar} from '@monokle/components';

import {CurrentProjectSettings} from './CurrentProjectSettings/CurrentProjectSettings';
import {DefaultProjectSettings} from './DefaultProjectSettings/DefaultProjectSettings';
import {GlobalSettings} from './GlobalSettings/GlobalSettings';
import {PluginManager} from './PluginsManager/PluginManager';
import * as S from './SettingsPane.styled';

export const SettingsPane = () => {
  const height = usePaneHeight();
  const [activeTabKey, setActiveTabKey] = useState('validation');

  const tabItems = useMemo(
    () => [
      {
        key: 'validation',
        label: <TabHeader>Validation</TabHeader>,
        children: <S.TabItemContainer>Validation</S.TabItemContainer>,
        style: {height: '100%'},
      },
      {
        key: 'plugins-manager',
        label: <TabHeader>Plugins Manager</TabHeader>,
        children: (
          <S.TabItemContainer>
            <PluginManager />
          </S.TabItemContainer>
        ),
        style: {height: '100%'},
      },
      {
        key: 'current-project-settings',
        label: <TabHeader>Current project settings</TabHeader>,
        children: (
          <S.TabItemContainer>
            <CurrentProjectSettings />
          </S.TabItemContainer>
        ),
        style: {height: '100%'},
      },
      {
        key: 'default-project-settings',
        label: <TabHeader>Default project settings</TabHeader>,
        children: (
          <S.TabItemContainer>
            <DefaultProjectSettings />
          </S.TabItemContainer>
        ),
        style: {height: '100%'},
      },
      {
        key: 'global-settings',
        label: <TabHeader>Global settings</TabHeader>,
        children: (
          <S.TabItemContainer>
            <GlobalSettings />
          </S.TabItemContainer>
        ),
        style: {height: '100%'},
      },
    ],
    []
  );

  return (
    <S.SettingsPaneContainer>
      <div>
        <TitleBar title="Settings" description={<TitleCardDescription />} />
      </div>
      <div>
        <S.Tabs
          $height={height - 160}
          defaultActiveKey="source"
          activeKey={activeTabKey}
          items={tabItems}
          onChange={(k: string) => setActiveTabKey(k)}
        />
      </div>
    </S.SettingsPaneContainer>
  );
};

export const TitleCardDescription = () => {
  const dispatch = useAppDispatch();
  const [selectedLayout, setSelectedLayout] = useState('EDITOR');
  const [selectedTheme, setSelectedTheme] = useState('DARK');

  return (
    <S.DescriptionContainer>
      <S.WalkThroughContainer>
        <S.CurlyArrowImage src={CurlyArrow} />
        <div>
          <S.WalkThroughTitle>Walking you through Monokle</S.WalkThroughTitle>
          <S.WalkThroughContent>
            Let us show you where to start, whereas is to explore, edit, validate or publish your k8s resources.
            <S.WalkThroughAction
              onClick={() => {
                dispatch(cancelWalkthrough('novice'));
                dispatch(handleWalkthroughStep({step: StepEnum.Next, collection: 'novice'}));
              }}
            >
              Go &rarr;
            </S.WalkThroughAction>
          </S.WalkThroughContent>
        </div>
      </S.WalkThroughContainer>
      <S.LayoutOption
        style={{marginLeft: '16px'}}
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
        style={{marginLeft: '8px'}}
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
      <S.ThemeOption
        style={{marginLeft: '16px'}}
        $selected={selectedTheme === 'DARK'}
        onClick={() => {
          setSelectedTheme('DARK');
        }}
      >
        <img src={LayoutDark} />
      </S.ThemeOption>
      <S.ThemeOption
        style={{marginLeft: '8px'}}
        $selected={selectedTheme === 'LIGHT'}
        onClick={() => {
          setSelectedTheme('LIGHT');
        }}
      >
        <img src={LayoutWhite} />
      </S.ThemeOption>
    </S.DescriptionContainer>
  );
};
