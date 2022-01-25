import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {Badge, Tooltip} from 'antd';

import {TOOLTIP_DELAY} from '@constants/constants';
import {NotificationsTooltip, SettingsTooltip} from '@constants/tooltips';

import {HelmChart, HelmValuesFile} from '@models/helm';
import {K8sResource} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateStartupModalVisible} from '@redux/reducers/appConfig';
import {toggleNotifications, toggleSettings} from '@redux/reducers/ui';
import {activeResourcesSelector, isInPreviewModeSelector, kubeConfigContextSelector} from '@redux/selectors';
import {stopPreview} from '@redux/services/preview';

import MonokleKubeshopLogo from '@assets/MonokleKubeshopLogo.svg';

import ClusterSelection from './ClusterSelection';
import HelpMenu from './HelpMenu';

import * as S from './styled';

const ExitButton = (props: {onClick: () => void}) => {
  const {onClick} = props;
  return (
    <S.ExitButton onClick={onClick}>
      <S.CloseCircleOutlined />
      Exit
    </S.ExitButton>
  );
};

const PageHeader = () => {
  const previewResourceId = useAppSelector(state => state.main.previewResourceId);
  const previewValuesFileId = useAppSelector(state => state.main.previewValuesFileId);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const activeResources = useSelector(activeResourcesSelector);
  const currentContext = useAppSelector(kubeConfigContextSelector);
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);
  const helmChartMap = useAppSelector(state => state.main.helmChartMap);
  const previewType = useAppSelector(state => state.main.previewType);
  const unseenNotificationsCount = useAppSelector(state => state.main.notifications.filter(n => !n.hasSeen).length);

  const isInPreviewMode = useSelector(isInPreviewModeSelector);

  const [previewResource, setPreviewResource] = useState<K8sResource>();
  const [previewValuesFile, setPreviewValuesFile] = useState<HelmValuesFile>();
  const [helmChart, setHelmChart] = useState<HelmChart>();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (previewResourceId) {
      setPreviewResource(resourceMap[previewResourceId]);
    } else {
      setPreviewResource(undefined);
    }

    if (previewValuesFileId && helmValuesMap[previewValuesFileId]) {
      const valuesFile = helmValuesMap[previewValuesFileId];
      setPreviewValuesFile(valuesFile);
      setHelmChart(helmChartMap[valuesFile.helmChartId]);
    } else {
      setPreviewValuesFile(undefined);
      setHelmChart(undefined);
    }
  }, [previewResourceId, previewValuesFileId, helmValuesMap, resourceMap, helmChartMap]);

  const toggleSettingsDrawer = () => {
    dispatch(toggleSettings());
  };

  const toggleNotificationsDrawer = () => {
    dispatch(toggleNotifications());
  };

  const showStartupModal = () => {
    dispatch(updateStartupModalVisible(true));
  };

  const onClickExit = () => {
    stopPreview(dispatch);
  };

  return (
    <>
      {isInPreviewMode && previewType === 'kustomization' && (
        <S.PreviewRow noborder="true">
          <S.ModeSpan>PREVIEW MODE</S.ModeSpan>
          {previewResource && (
            <S.ResourceSpan>
              Previewing [{previewResource.name}] kustomization - {activeResources.length} resources
            </S.ResourceSpan>
          )}
          <ExitButton onClick={onClickExit} />
        </S.PreviewRow>
      )}
      {isInPreviewMode && previewType === 'cluster' && (
        <S.ClusterRow>
          <S.ModeSpan>CLUSTER MODE</S.ModeSpan>
          {previewResourceId && (
            <S.ResourceSpan>
              Previewing context [{currentContext}] - {activeResources.length} resources
            </S.ResourceSpan>
          )}
          <ExitButton onClick={onClickExit} />
        </S.ClusterRow>
      )}
      {isInPreviewMode && previewType === 'helm' && (
        <S.PreviewRow noborder="true">
          <S.ModeSpan>HELM MODE</S.ModeSpan>
          {previewValuesFileId && (
            <S.ResourceSpan>
              Previewing {previewValuesFile?.name} for {helmChart?.name} Helm chart - {activeResources.length} resources
            </S.ResourceSpan>
          )}
          <ExitButton onClick={onClickExit} />
        </S.PreviewRow>
      )}
      <S.Header noborder="true">
        <S.Row noborder="true">
          <S.LogoCol noborder="true">
            <S.Logo onClick={showStartupModal} src={MonokleKubeshopLogo} alt="Monokle" />
          </S.LogoCol>

          <ClusterSelection previewResource={previewResource} />

          <S.SettingsCol>
            <HelpMenu />
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={SettingsTooltip}>
              <S.IconContainerSpan>
                <S.SettingsOutlined onClick={toggleSettingsDrawer} />
              </S.IconContainerSpan>
            </Tooltip>
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={NotificationsTooltip}>
              <S.IconContainerSpan>
                <Badge count={unseenNotificationsCount} size="small">
                  <S.BellOutlined onClick={toggleNotificationsDrawer} />
                </Badge>
              </S.IconContainerSpan>
            </Tooltip>
          </S.SettingsCol>
        </S.Row>
      </S.Header>
    </>
  );
};

export default PageHeader;
