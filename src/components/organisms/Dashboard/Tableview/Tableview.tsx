import {useEffect} from 'react';

import {ColumnsType} from 'antd/lib/table';

import {K8sResource} from '@models/k8sresource';

import * as S from './Tableview.styled';

export const Tableview = ({dataSource, columns}: {dataSource: K8sResource[]; columns: ColumnsType<any>}) => {
  useEffect(() => {
    console.log(dataSource);
  }, [dataSource]);
  return (
    <S.Table
      dataSource={dataSource}
      columns={columns}
      rowKey="id"
      scroll={{y: 700}}
      rowSelection={{}}
      pagination={false}
      sticky
    />
  );
};
