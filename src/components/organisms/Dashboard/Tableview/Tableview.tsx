import {useEffect} from 'react';

import {Button} from 'antd';
import {ColumnsType} from 'antd/lib/table';

import {SearchOutlined} from '@ant-design/icons';

import {K8sResource} from '@models/k8sresource';

import {useMainPaneDimensions} from '@utils/hooks';

import * as S from './Tableview.styled';

export const Tableview = ({dataSource, columns}: {dataSource: K8sResource[]; columns: ColumnsType<any>}) => {
  const {height} = useMainPaneDimensions();

  useEffect(() => {
    console.log(dataSource);
  }, [dataSource]);

  return (
    <S.Container>
      <S.FilterContainer>
        <S.Input size="large" placeholder="Search and filter" prefix={<SearchOutlined />} />
        <Button size="large" disabled>
          Bulk action
        </Button>
      </S.FilterContainer>
      <S.Table
        dataSource={dataSource}
        columns={columns}
        rowKey="id"
        scroll={{y: height - 212}}
        rowSelection={{}}
        pagination={false}
        sticky
      />
    </S.Container>
  );
};
