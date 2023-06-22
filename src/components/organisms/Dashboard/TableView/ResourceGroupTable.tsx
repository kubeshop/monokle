import {useMemo, useState} from 'react';

import {ColumnsType} from 'antd/lib/table';

import {setActiveDashboardMenu, setDashboardSelectedResourceId} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {useMainPaneDimensions} from '@utils/hooks';

import {DashboardMenu} from '@shared/models/dashboard';
import {K8sResource} from '@shared/models/k8sResource';
import {ResourceKindHandler} from '@shared/models/resourceKindHandler';
import {RootState} from '@shared/models/rootState';
import {trackEvent} from '@shared/utils/telemetry';

import {Drawer} from './Drawer';
import * as S from './Tableview.styled';

const UNSORTED_VALUE = -9999999;

export const ResourceGroupTable = ({dataSource}: {dataSource: any[]}) => {
  const dispatch = useAppDispatch();
  const {height} = useMainPaneDimensions();
  const [filterText, setFilterText] = useState<string>('');
  const selectedResourceId = useAppSelector((state: RootState) => state.dashboard.tableDrawer.selectedResourceId);

  const filteredDataSource = useMemo(() => {
    if (!filterText) {
      return dataSource;
    }
    return dataSource.filter(s => s.kind.toLowerCase().trim().includes(filterText.toLocaleLowerCase().trim()));
  }, [dataSource, filterText]);

  const setActiveMenu = (menuItem: DashboardMenu) => {
    trackEvent('dashboard/selectKind', {kind: menuItem.key});
    dispatch(setActiveDashboardMenu(menuItem));
    dispatch(setDashboardSelectedResourceId());
  };

  return (
    <S.Container>
      <S.FilterContainer>
        <S.Input
          size="large"
          placeholder="Search and filter"
          prefix={<S.SearchOutlined />}
          onChange={(event: any) => setFilterText(event.target.value)}
          allowClear
        />
        {/* <S.BulkAction size="large" disabled>
          Bulk action
        </S.BulkAction> */}
      </S.FilterContainer>
      <S.TableContainer>
        <S.Table
          dataSource={filteredDataSource}
          columns={resourceGroupColumns}
          rowKey="kind"
          scroll={{y: height - 212}}
          rowClassName={(record: K8sResource | any) => (record.kind === selectedResourceId ? 'selected' : '')}
          pagination={false}
          sticky
          onRow={(record: any) => {
            return {
              onClick: () => {
                setActiveMenu(record.menu as DashboardMenu);
              },
            };
          }}
        />
        <Drawer />
      </S.TableContainer>
    </S.Container>
  );
};

export const resourceGroupColumns: ColumnsType<any> = [
  {
    title: 'Kind',
    dataIndex: 'kind',
    key: 'kind',
    width: '150px',
    render: (content: any) => <span>{content}</span>,
    sorter: (a: ResourceKindHandler, b: ResourceKindHandler) => a?.kind?.localeCompare(b?.kind || '') || UNSORTED_VALUE,
  },
  {
    title: 'Api Version',
    dataIndex: 'clusterApiVersion',
    key: 'clusterApiVersion',
    width: '150px',
    render: (content: any) => <span>{content}</span>,
    sorter: (a: ResourceKindHandler, b: ResourceKindHandler) =>
      a?.clusterApiVersion?.localeCompare(b?.clusterApiVersion || '') || UNSORTED_VALUE,
  },
  {
    title: 'Scope',
    dataIndex: 'isNamespaced',
    key: 'isNamespaced',
    width: '150px',
    render: (content: any) => (content ? <span>Namespaced</span> : <span>Cluster</span>),
    sorter: (a: ResourceKindHandler) => (a?.isNamespaced ? UNSORTED_VALUE : 0),
  },
  {
    title: 'Resources',
    dataIndex: 'menu',
    key: 'menu',
    width: '150px',
    render: (menu: any) => <span>{menu.resourceCount}</span>,
    // eslint-disable-next-line no-unsafe-optional-chaining
    sorter: (a: any, b: any) => (a && b ? a.resourceCount - b.resourceCount : 0),
  },
];
