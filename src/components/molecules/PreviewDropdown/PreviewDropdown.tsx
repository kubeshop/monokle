import React, {useCallback, useMemo} from 'react';
import {shallowEqual} from 'react-redux';

import {Dropdown} from 'antd';

import {DownOutlined} from '@ant-design/icons';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectHelmValuesFile, selectK8sResource} from '@redux/reducers/main';
import {
  kustomizationsSelector,
  previewedHelmChartSelector,
  previewedKustomizationSelector,
  previewedValuesFileSelector,
} from '@redux/selectors';
import {startPreview} from '@redux/services/preview';

import {HelmChartMenuItem} from '@shared/models/helm';
import {KustomizationMenuItem} from '@shared/models/kustomize';
import {BackgroundColors, Colors} from '@shared/styles/colors';

import * as S from './PreviewDropdown.styled';
import PreviewMenu from './PreviewMenu';

interface IProps {
  btnStyle?: React.CSSProperties;
}

const PreviewDropdown: React.FC<IProps> = props => {
  const {btnStyle} = props;

  const dispatch = useAppDispatch();
  const previewedHelmChart = useAppSelector(previewedHelmChartSelector);
  const previewedValuesFile = useAppSelector(previewedValuesFileSelector);
  const previewedKustomization = useAppSelector(previewedKustomizationSelector);
  const selection = useAppSelector(state => state.main.selection);

  const valuesFileMap = useAppSelector(state => state.main.helmValuesMap);

  const helmChartMenuItems: HelmChartMenuItem[] = useAppSelector(state => {
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

  const kustomizationMenuItems: KustomizationMenuItem[] = useAppSelector(state => {
    return kustomizationsSelector(state)
      .map(res => ({id: res.id, name: res.name}))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, shallowEqual);

  const selectAndPreviewKustomization = useCallback(
    (kustomizationId: string) => {
      if (
        !selection ||
        selection?.type !== 'resource' ||
        selection.resourceStorage !== 'local' ||
        selection.resourceId !== kustomizationId
      ) {
        dispatch(selectK8sResource({resourceId: kustomizationId}));
      }
      if (kustomizationId !== previewedKustomization?.id) {
        startPreview({type: 'kustomize', kustomizationId}, dispatch);
      }
    },
    [selection, previewedKustomization, dispatch]
  );

  const selectAndPreviewHelmValuesFile = useCallback(
    (valuesFileId: string) => {
      const valuesFileToPreview = valuesFileMap[valuesFileId];
      if (selection?.type !== 'helm.values.file' || selection.valuesFileId !== valuesFileId) {
        dispatch(selectHelmValuesFile({valuesFileId}));
      }
      if (valuesFileId !== previewedValuesFile?.id) {
        startPreview({type: 'helm', valuesFileId, chartId: valuesFileToPreview.helmChartId}, dispatch);
      }
    },
    [selection, valuesFileMap, previewedValuesFile, dispatch]
  );

  const previewKey = useMemo(() => {
    if (previewedKustomization) {
      return `kustomization__${previewedKustomization.id}`;
    }
    if (previewedValuesFile) {
      return `valuesFile__${previewedValuesFile.id}`;
    }
  }, [previewedKustomization, previewedValuesFile]);

  const previewText = useMemo(() => {
    if (previewedKustomization) {
      return `Kustomization: ${previewedKustomization.name}`;
    }
    if (previewedValuesFile && previewedHelmChart) {
      return `Helm Chart: ${previewedHelmChart.name} - ${previewedValuesFile.name}`;
    }
  }, [previewedKustomization, previewedValuesFile, previewedHelmChart]);

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
      disabled={helmChartMenuItems.length === 0 && kustomizationMenuItems.length === 0}
      overlay={
        <PreviewMenu
          helmCharts={helmChartMenuItems}
          kustomizations={kustomizationMenuItems}
          onClick={onMenuItemClick}
          previewKey={previewKey}
        />
      }
    >
      <S.PreviewButton
        type={previewText ? 'default' : 'primary'}
        ghost={!previewText}
        style={
          previewText
            ? {background: BackgroundColors.previewModeBackground, color: Colors.blackPure, ...btnStyle}
            : btnStyle
        }
      >
        <span>{previewText || 'Preview'}</span> <DownOutlined />
      </S.PreviewButton>
    </Dropdown>
  );
};
export default PreviewDropdown;
