import {useMemo, useState} from 'react';

import {ColumnsType} from 'antd/lib/table';

import {setActiveTab, setDashboardSelectedResourceId} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectResource} from '@redux/reducers/main';

import {useMainPaneDimensions} from '@utils/hooks';

import {ResourceMeta} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';

import {Drawer} from './Drawer';
import NoResourcesFound from './NoResourcesFound';
import * as S from './TableView.styled';

const TableView = ({dataSource, columns}: {dataSource: ResourceMeta[]; columns: ColumnsType<any>}) => {
  const dispatch = useAppDispatch();
  const {height} = useMainPaneDimensions();
  const [filterText, setFilterText] = useState<string>('');
  const selectedResourceId = useAppSelector((state: RootState) => state.dashboard.tableDrawer.selectedResourceId);
  const terminalHeight = useAppSelector(state => state.ui.paneConfiguration.bottomPaneHeight);
  const bottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);

  const filteredDataSource = useMemo(() => {
    return dataSource.filter(s => s.name.toLowerCase().trim().includes(filterText.toLocaleLowerCase().trim()));
  }, [dataSource, filterText]);

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
      </S.FilterContainer>

      <S.TableContainer>
        <S.Table
          locale={{emptyText: <NoResourcesFound />}}
          dataSource={filteredDataSource}
          columns={columns}
          rowKey="id"
          scroll={{y: height - 212 - (bottomSelection === 'terminal' ? terminalHeight : 0)}}
          rowClassName={(record: ResourceMeta | any) => (record.id === selectedResourceId ? 'selected' : '')}
          pagination={false}
          sticky
          onRow={(record: ResourceMeta | any) => {
            return {
              onClick: () => {
                dispatch(setDashboardSelectedResourceId(record.id));
                dispatch(setActiveTab({tab: 'Info', kind: record.kind}));
                dispatch(selectResource({resourceIdentifier: {id: record.id, storage: 'cluster'}}));
              },
            };
          }}
        />
        <Drawer />
      </S.TableContainer>
    </S.Container>
  );
};

export default TableView;
