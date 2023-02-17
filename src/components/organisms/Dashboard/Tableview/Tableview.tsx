import {useEffect, useState} from 'react';

import {ColumnsType} from 'antd/lib/table';

import {setDashboardSelectedResourceId} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectResource} from '@redux/reducers/main';

import {useMainPaneDimensions} from '@utils/hooks';

import {ResourceMeta} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';

import {Drawer} from './Drawer';
import * as S from './Tableview.styled';

export const Tableview = ({dataSource, columns}: {dataSource: ResourceMeta[]; columns: ColumnsType<any>}) => {
  const dispatch = useAppDispatch();
  const {height} = useMainPaneDimensions();
  const [filteredDataSource, setFilteredDataSource] = useState(dataSource);
  const [filterText, setFilterText] = useState<string>('');
  const selectedResourceId = useAppSelector((state: RootState) => state.dashboard.tableDrawer.selectedResourceId);
  const clusterConnectionOptions = useAppSelector(state => state.main.clusterConnectionOptions);

  useEffect(() => {
    if (!filterText) {
      setFilteredDataSource(dataSource);
      return;
    }
    setFilteredDataSource(
      dataSource.filter(s => s.name.toLowerCase().trim().includes(filterText.toLocaleLowerCase().trim()))
    );
  }, [dataSource, filterText]);

  useEffect(() => {
    dispatch(setDashboardSelectedResourceId());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusterConnectionOptions]);

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
          columns={columns}
          rowKey="id"
          scroll={{y: height - 212}}
          rowClassName={(record: ResourceMeta | any) => (record.id === selectedResourceId ? 'selected' : '')}
          pagination={false}
          sticky
          onRow={(record: ResourceMeta | any) => {
            return {
              onClick: () => {
                dispatch(setDashboardSelectedResourceId(record.id));
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
