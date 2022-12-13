import {useEffect, useState} from 'react';

import {ColumnsType} from 'antd/lib/table';

import {K8sResource} from '@models/k8sresource';
import {RootState} from '@models/rootstate';

import {setSelectedResourceId} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectK8sResource} from '@redux/reducers/main';

import {useMainPaneDimensions} from '@utils/hooks';

import {Drawer} from './Drawer';
import * as S from './Tableview.styled';

export const Tableview = ({dataSource, columns}: {dataSource: K8sResource[]; columns: ColumnsType<any>}) => {
  const dispatch = useAppDispatch();
  const {height} = useMainPaneDimensions();
  const [filteredDataSource, setFilteredDataSource] = useState(dataSource);
  const [filterText, setFilterText] = useState<string>('');
  const selectedResourceId = useAppSelector((state: RootState) => state.dashboard.tableDrawer.selectedResourceId);

  useEffect(() => {
    if (!filterText) {
      setFilteredDataSource(dataSource);
      return;
    }
    setFilteredDataSource(
      dataSource.filter(s => s.name.toLowerCase().trim().includes(filterText.toLocaleLowerCase().trim()))
    );
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
          rowClassName={(record: K8sResource | any) => (record.id === selectedResourceId ? 'selected' : '')}
          pagination={false}
          sticky
          onRow={(record: K8sResource | any) => {
            return {
              onClick: () => {
                dispatch(setSelectedResourceId(record.id));
                dispatch(selectK8sResource({resourceId: record.id}));
              },
            };
          }}
        />
        <Drawer />
      </S.TableContainer>
    </S.Container>
  );
};
