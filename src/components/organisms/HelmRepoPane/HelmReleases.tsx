import {useCallback, useEffect, useRef} from 'react';
import {useAsync} from 'react-use';

import {Form, Typography} from 'antd';
import {ColumnProps} from 'antd/lib/table';

import {RightOutlined, SearchOutlined} from '@ant-design/icons';

import {debounce} from 'lodash';
import {DateTime} from 'luxon';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setHelmPaneChartSearch, setSelectedHelmRelease} from '@redux/reducers/ui';

import {useMainPaneDimensions} from '@utils/hooks';

import {Icon} from '@monokle/components';
import {HelmRelease} from '@shared/models/ui';
import {openUrlInExternalBrowser} from '@shared/utils';
import {listHelmReleasesCommand, runCommandInMainThread} from '@shared/utils/commands';

import {NamespaceSelect} from '../PageHeader/ClusterControl/NamespaceSelect';
import HelmReleaseDetails from './HelmReleaseDetails/HelmReleaseDetails';

import * as S from './styled';

const CHART_NAME_REGEX = /^[a-z]([-a-z0-9]*[a-z0-9])?(\/[a-z]([-a-z0-9]*[a-z0-9])?)*$/gi;

const columns: ColumnProps<HelmRelease>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
    sorter: {
      multiple: 3,
    },
    responsive: ['sm'],
  },
  {
    title: 'Chart',
    dataIndex: 'chart',
    key: 'chart',
    ellipsis: true,
    responsive: ['sm'],
  },
  {
    title: 'Namespace',
    dataIndex: 'namespace',
    key: 'namespace',
    responsive: ['sm'],
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    responsive: ['sm'],
  },
  {
    title: 'Revision',
    dataIndex: 'revision',
    key: 'revision',
    responsive: ['sm'],
  },
  {
    title: 'App Version',
    dataIndex: 'app_version',
    key: 'app_version',
    responsive: ['sm'],
  },
  {
    title: 'Updated',
    dataIndex: 'updated',
    key: 'updated',
    responsive: ['sm'],
    render: (text: string) => {
      const [dateText, timeText] = text.split(' ');
      return DateTime.fromISO(`${dateText}T${timeText}`).toRelative();
    },
  },

  {
    title: '',
    dataIndex: '',
    key: 'x',
    responsive: ['sm'],
    width: 40,

    render: () => (
      <S.HoverArea>
        <RightOutlined style={{fontSize: 14}} />
      </S.HoverArea>
    ),
  },
];

const SearchForm = ({onChangeSearchInputHandler}: {onChangeSearchInputHandler: (q: string) => void}) => {
  const [form] = Form.useForm();
  const initialValue = useAppSelector(state => state.ui.helmPane.chartSearchToken);

  const helmRepoSearch = Form.useWatch('searchToken', form);
  useEffect(() => {
    onChangeSearchInputHandler(helmRepoSearch);
  }, [helmRepoSearch, onChangeSearchInputHandler]);

  return (
    <Form form={form} layout="inline">
      <Form.Item
        name="searchToken"
        rules={[
          {
            pattern: CHART_NAME_REGEX,
            message: 'Invalid input. please type a valid helm chart name.',
          },
        ]}
        initialValue={initialValue}
      >
        <S.Input placeholder="Search for a Helm release" prefix={<SearchOutlined />} size="large" />
      </Form.Item>
    </Form>
  );
};

const HelmReleases = () => {
  const dispatch = useAppDispatch();
  const leftMenuSelection = useAppSelector(state => state.ui.leftMenu.selection);
  const helmRepoSearch = useAppSelector(state => state.ui.helmPane.chartSearchToken);
  const selectedHelmRelease = useAppSelector(state => state.ui.helmPane.selectedHelmRelease);
  const {height} = useMainPaneDimensions();
  const terminalHeight = useAppSelector(state => state.ui.paneConfiguration.bottomPaneHeight);
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);

  const ref = useRef<HTMLDivElement>(null);

  const onItemClick = useCallback(
    (chart: HelmRelease) => {
      dispatch(setSelectedHelmRelease(chart));
    },
    [dispatch]
  );

  const {
    value: result = [],
    error,
    loading,
  } = useAsync(async () => {
    const output = await runCommandInMainThread(listHelmReleasesCommand({filter: helmRepoSearch, namespace: ''}));
    if (output.stderr) {
      throw new Error(output.stderr);
    }
    return JSON.parse(output.stdout || '[]');
  }, [helmRepoSearch]);

  const searchResultCount = result.length;
  const debouncedSearchRef = useRef(
    debounce((search: string) => {
      dispatch(setHelmPaneChartSearch(search));
    }, 400)
  );

  const onChangeSearchInputHandler = useCallback((search: string) => {
    debouncedSearchRef.current(search);
  }, []);

  return (
    <>
      <div style={{display: 'flex', gap: 16, alignItems: 'center', height: 72}}>
        <SearchForm onChangeSearchInputHandler={onChangeSearchInputHandler} />
        <NamespaceSelect />
      </div>

      {error ? (
        <S.ErrorText>
          <Icon name="warning" style={{marginRight: 4}} />
          Error: {error.message} <Typography.Text>- Please check helm from </Typography.Text>
          <Typography.Link onClick={() => openUrlInExternalBrowser('https://helm.sh/docs/intro/install/')}>
            here
          </Typography.Link>
        </S.ErrorText>
      ) : (
        <Typography.Text style={{height: 'fit-content', marginBottom: 12}}>
          {searchResultCount} Helm releases found.
        </Typography.Text>
      )}

      <div ref={ref} style={{overflow: 'hidden', flex: 1}}>
        <S.Table
          showSorterTooltip
          sticky
          rowKey="name"
          dataSource={result}
          columns={columns}
          sortDirections={['ascend', 'descend']}
          loading={loading}
          pagination={false}
          scroll={{y: height - 360 - (bottomSelection === 'terminal' ? terminalHeight : 0)}}
          rowClassName={(record: HelmRelease) => (record.name === selectedHelmRelease?.name ? 'row-selected' : '')}
          onRow={(record: HelmRelease) => ({
            onClick: () => onItemClick(record),
          })}
        />
      </div>
      {leftMenuSelection === 'helm' && selectedHelmRelease && <HelmReleaseDetails />}
    </>
  );
};

export default HelmReleases;
