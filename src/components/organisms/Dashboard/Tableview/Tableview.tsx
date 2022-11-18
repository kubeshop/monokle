import {useEffect, useState} from 'react';

import {Button, Drawer, DrawerProps} from 'antd';
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

  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<DrawerProps['size']>();

  const showLargeDrawer = () => {
    setSize('large');
    setOpen(true);
  };

  return (
    <S.Container>
      <S.FilterContainer>
        <S.Input size="large" placeholder="Search and filter" prefix={<SearchOutlined />} />
        <Button size="large" disabled>
          Bulk action
        </Button>
      </S.FilterContainer>
      <div style={{position: 'relative', height: '100%'}}>
        <S.Table
          dataSource={dataSource}
          columns={columns}
          rowKey="id"
          scroll={{y: height - 212}}
          rowSelection={{}}
          pagination={false}
          sticky
          onRow={(record, rowIndex) => {
            return {
              onClick: event => {
                showLargeDrawer();
              }, // click row
              onDoubleClick: event => {}, // double click row
              onContextMenu: event => {}, // right button click row
              onMouseEnter: event => {}, // mouse enter row
              onMouseLeave: event => {}, // mouse leave row
            };
          }}
        />
        <Drawer
          placement="right"
          size={size}
          open={open}
          getContainer={false}
          onClose={() => {
            setOpen(false);
          }}
        >
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Drawer>
      </div>
    </S.Container>
  );
};
