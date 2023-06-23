import {useCallback, useMemo, useState} from 'react';
import {useAsync} from 'react-use';

import {Dropdown} from 'antd';

import {CloudDownloadOutlined, DownOutlined} from '@ant-design/icons';

import {first} from 'lodash';
import {Tab} from 'rc-tabs/lib/interface';

import {kubeConfigContextSelector} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setHelmPaneChartDetailsTab, setHelmPaneSelectedChart} from '@redux/reducers/ui';
import {installHelmRepoChart} from '@redux/thunks/InstallHelmRepoChart';

import {HelmChartModalConfirmWithNamespaceSelect} from '@components/molecules';

import {Icon} from '@monokle/components';
import {HelmChartDetailsTab} from '@shared/models/ui';
import {trackEvent} from '@shared/utils';
import {runCommandInMainThread, searchHelmRepoCommand} from '@shared/utils/commands';

import HelmInfo from './HelmChartTabs/HelmInfo';
import HelmTemplate from './HelmChartTabs/HelmTemplate';
import HelmValues from './HelmChartTabs/HelmValues';
import HelmReadme from './HelmChartTabs/HemlReadme';
import PullHelmChartModal from './PullHelmChartModal';

import * as S from './styled';

const createTabItems = (chartName: string): Tab[] => [
  {
    key: 'info',
    label: 'Info',
    children: <HelmInfo chartName={chartName} />,
  },
  {
    key: 'defaultValues',
    label: 'Default Values',
    children: <HelmValues chartName={chartName} />,
  },
  {
    key: 'templates',
    label: 'Dry-run Output',
    children: <HelmTemplate chartName={chartName} />,
  },
  {
    key: 'changelog',
    label: 'Changelog',
    children: <HelmReadme chartName={chartName} />,
  },
];

const HelmChartDetails = () => {
  const dispatch = useAppDispatch();
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const selectedChart = useAppSelector(state => state.ui.helmPane.selectedChart);
  const chartDetailsTab = useAppSelector(state => state.ui.helmPane.chartDetailsTab);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [chartVersion, setChartVersion] = useState('');
  const chart = selectedChart?.name || '';

  const tabItems = useMemo(() => createTabItems(chart), [chart]);

  const {value: versions = [], loading: isLoadingVersions} = useAsync(async (): Promise<{version: string}[]> => {
    const result = await runCommandInMainThread(searchHelmRepoCommand({q: chart}, true));
    return JSON.parse(result.stdout || '[]');
  });

  const onClickApplyHelmChart = useCallback(
    async (namespace?: string, shouldCreateNamespace?: boolean) => {
      await dispatch(
        installHelmRepoChart({
          chart,
          namespace,
          version: chartVersion,
          shouldCreateNamespace,
        })
      ).unwrap();
      setInstallModalOpen(false);
      trackEvent('helm_repo/install');
    },
    [chart, chartVersion, dispatch]
  );

  const latestVersion = first<{version: string}>(versions)?.version || '';

  const items = useMemo(
    () =>
      versions
        .filter(i => i.version !== latestVersion)
        .map((i: any) => ({
          label: i.version,
          key: i.version,
        })),
    [versions, latestVersion]
  );

  const onDownloadLatestHelmChartHandler = () => {
    setChartVersion(latestVersion);
    setConfirmModalOpen(true);
  };

  const onInstallLatestHelmChartHandler = () => {
    setChartVersion(latestVersion);
    setInstallModalOpen(true);
  };

  return (
    <S.Drawer
      placement="right"
      size="large"
      open={Boolean(chart)}
      getContainer={false}
      title={<S.Title>{chart}</S.Title>}
      onClose={() => dispatch(setHelmPaneSelectedChart(null))}
    >
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <S.Tabs
          items={tabItems}
          activeKey={chartDetailsTab}
          onChange={(key: HelmChartDetailsTab) => dispatch(setHelmPaneChartDetailsTab(key))}
        />
        <S.Footer>
          <S.MenuDropdownList id="versions" />
          <Dropdown.Button
            loading={isLoadingVersions}
            menu={{
              items,
              onClick: ({key}) => {
                setChartVersion(key);
                setConfirmModalOpen(true);
              },
            }}
            size="large"
            type="primary"
            icon={<DownOutlined />}
            onClick={onDownloadLatestHelmChartHandler}
            getPopupContainer={() => document.getElementById('versions')!}
          >
            <CloudDownloadOutlined />
            Download locally ({latestVersion})
          </Dropdown.Button>
          <Dropdown.Button
            loading={isLoadingVersions}
            menu={{
              items,
              onClick: ({key}) => {
                setChartVersion(key);
                setInstallModalOpen(true);
              },
            }}
            size="large"
            type="primary"
            icon={<DownOutlined />}
            onClick={onInstallLatestHelmChartHandler}
            getPopupContainer={() => document.getElementById('versions')!}
          >
            <Icon name="cluster-dashboard" />
            Install in cluster ({latestVersion})
          </Dropdown.Button>
        </S.Footer>

        <PullHelmChartModal
          open={confirmModalOpen}
          dismissModal={() => setConfirmModalOpen(false)}
          chartName={chart}
          chartVersion={chartVersion}
          isLatestVersion={chartVersion === latestVersion}
        />

        <HelmChartModalConfirmWithNamespaceSelect
          isVisible={installModalOpen}
          title={`Install the ${chart} Chart in cluster [${kubeConfigContext}]?`}
          onCancel={() => setInstallModalOpen(false)}
          onOk={(selectedNamespace, shouldCreateNamespace) =>
            onClickApplyHelmChart(selectedNamespace, shouldCreateNamespace)
          }
        />
      </div>
    </S.Drawer>
  );
};

export default HelmChartDetails;
