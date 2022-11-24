import {useEffect} from 'react';

import {ColumnsType} from 'antd/lib/table';

import {SearchOutlined} from '@ant-design/icons';

import {K8sResource} from '@models/k8sresource';

import {setSelectedResourceId} from '@redux/dashboard';
import {useAppDispatch} from '@redux/hooks';
import {selectK8sResource} from '@redux/reducers/main';

import {useMainPaneDimensions} from '@utils/hooks';

import {Drawer} from './Drawer';
import * as S from './Tableview.styled';

export const Tableview = ({dataSource, columns}: {dataSource: K8sResource[]; columns: ColumnsType<any>}) => {
  const dispatch = useAppDispatch();
  const {height} = useMainPaneDimensions();

  useEffect(() => {
    console.log(dataSource);
  }, [dataSource]);

  return (
    <S.Container>
      <S.FilterContainer>
        <S.Input size="large" placeholder="Search and filter" prefix={<SearchOutlined />} />
        <S.BulkAction size="large" disabled>
          Bulk action
        </S.BulkAction>
      </S.FilterContainer>
      <S.TableContainer>
        <S.Table
          dataSource={dataSource}
          columns={columns}
          rowKey="id"
          scroll={{y: height - 212}}
          rowSelection={{}}
          pagination={false}
          sticky
          onRow={(record: K8sResource | any, rowIndex) => {
            return {
              onClick: event => {
                console.log(record);
                console.log(rowIndex);
                dispatch(setSelectedResourceId(record.id));
                dispatch(selectK8sResource({resourceId: record.id}));
              }, // click row
              onDoubleClick: event => {}, // double click row
              onContextMenu: event => {}, // right button click row
              onMouseEnter: event => {}, // mouse enter row
              onMouseLeave: event => {}, // mouse leave row
            };
          }}
        />
        <Drawer />
      </S.TableContainer>
    </S.Container>
  );
};