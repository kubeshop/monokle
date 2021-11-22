import React, {useCallback, useMemo} from 'react';
import {shallowEqual} from 'react-redux';

import {Button, Dropdown, Menu} from 'antd';

import {DownOutlined} from '@ant-design/icons';

import {MenuClickEventHandler} from 'rc-menu/lib/interface';
import styled from 'styled-components';

import {KUSTOMIZATION_KIND} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectHelmValuesFile, selectK8sResource} from '@redux/reducers/main';
import {startPreview} from '@redux/services/preview';

import Colors, {BackgroundColors} from '@styles/Colors';

const {SubMenu} = Menu;

type HelmChartMenuItem = {
  id: string;
  name: string;
  subItems: {id: string; name: string}[];
};

type KustomizationMenuItem = {
  id: string;
  name: string;
};

const StyledButton = styled(Button)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PreviewMenu = (props: {
  helmCharts: HelmChartMenuItem[];
  kustomizations: KustomizationMenuItem[];
  onClick: MenuClickEventHandler;
  previewKey?: string;
}) => {
  const {helmCharts, kustomizations, previewKey, onClick} = props;

  return (
    <Menu onClick={onClick} selectedKeys={previewKey ? [previewKey] : undefined}>
      <SubMenu title="Helm Charts" key="helmcharts" disabled={helmCharts.length === 0}>
        {helmCharts.map(helmChart => (
          <Menu.ItemGroup title={helmChart.name} key={helmChart.id}>
            {helmChart.subItems.map(valuesFile => (
              <Menu.Item key={`valuesFile__${valuesFile.id}`}>{valuesFile.name}</Menu.Item>
            ))}
          </Menu.ItemGroup>
        ))}
      </SubMenu>
      <SubMenu
        title="Kustomizations"
        style={{maxHeight: 250}}
        key="kustomizations"
        disabled={kustomizations.length === 0}
      >
        {kustomizations.map(kustomization => (
          <Menu.Item key={`kustomization__${kustomization.id}`}>{kustomization.name}</Menu.Item>
        ))}
      </SubMenu>
    </Menu>
  );
};

const PreviewDropdown = (props: {btnStyle?: React.CSSProperties}) => {
  const {btnStyle} = props;
  const dispatch = useAppDispatch();

  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const previewResource = useAppSelector(state =>
    state.main.previewResourceId ? state.main.resourceMap[state.main.previewResourceId] : undefined
  );
  const selectedValuesFileId = useAppSelector(state => state.main.selectedValuesFileId);
  const previewValuesFile = useAppSelector(state =>
    state.main.previewValuesFileId ? state.main.helmValuesMap[state.main.previewValuesFileId] : undefined
  );
  const previewHelmChart = useAppSelector(state =>
    previewValuesFile ? state.main.helmChartMap[previewValuesFile.helmChartId] : undefined
  );

  const helmCharts: HelmChartMenuItem[] = useAppSelector(state => {
    const helmValuesMap = state.main.helmValuesMap;
    return Object.values(state.main.helmChartMap).map(helmChart => {
      const valuesFiles = helmChart.valueFileIds.map(valuesFileId => helmValuesMap[valuesFileId]);
      return {
        id: helmChart.id,
        name: helmChart.name,
        subItems: valuesFiles.map(valuesFile => {
          return {
            id: valuesFile.id,
            name: valuesFile.name,
          };
        }),
      };
    });
  }, shallowEqual);

  const kustomizations: KustomizationMenuItem[] = useAppSelector(state => {
    return Object.values(state.main.resourceMap)
      .filter(i => i.kind === KUSTOMIZATION_KIND)
      .map(res => ({id: res.id, name: res.name}))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, shallowEqual);

  const selectAndPreviewKustomization = useCallback(
    (resourceId: string) => {
      if (resourceId !== selectedResourceId) {
        dispatch(selectK8sResource({resourceId}));
      }
      if (resourceId !== previewResource?.id) {
        startPreview(resourceId, 'kustomization', dispatch);
      }
    },
    [selectedResourceId, previewResource, dispatch]
  );

  const selectAndPreviewHelmValuesFile = useCallback(
    (valuesFileId: string) => {
      if (valuesFileId !== selectedValuesFileId) {
        dispatch(selectHelmValuesFile({valuesFileId}));
      }
      if (valuesFileId !== previewValuesFile?.id) {
        startPreview(valuesFileId, 'helm', dispatch);
      }
    },
    [selectedValuesFileId, previewValuesFile, dispatch]
  );

  const previewKey = useMemo(() => {
    if (previewResource) {
      return `kustomization__${previewResource.id}`;
    }
    if (previewValuesFile) {
      return `valuesFile__${previewValuesFile.id}`;
    }
  }, [previewResource, previewValuesFile]);

  const previewText = useMemo(() => {
    if (previewResource) {
      return `Kustomization: ${previewResource.name}`;
    }
    if (previewValuesFile && previewHelmChart) {
      return `Helm Chart: ${previewHelmChart.name} - ${previewValuesFile.name}`;
    }
  }, [previewResource, previewValuesFile, previewHelmChart]);

  const onMenuItemClick = ({key}: {key: string}) => {
    const [type, id] = key.split('__');

    if (type === 'kustomization') {
      selectAndPreviewKustomization(id);
    }
    if (type === 'valuesFile') {
      selectAndPreviewHelmValuesFile(id);
    }
  };

  return (
    <Dropdown
      disabled={helmCharts.length === 0 && kustomizations.length === 0}
      overlay={
        <PreviewMenu
          helmCharts={helmCharts}
          kustomizations={kustomizations}
          onClick={onMenuItemClick}
          previewKey={previewKey}
        />
      }
    >
      <StyledButton
        type={previewText ? 'default' : 'primary'}
        ghost={!previewText}
        style={
          previewText
            ? {background: BackgroundColors.previewModeBackground, color: Colors.blackPure, ...btnStyle}
            : btnStyle
        }
      >
        <span>{previewText || 'Preview'}</span> <DownOutlined />
      </StyledButton>
    </Dropdown>
  );
};
export default PreviewDropdown;
