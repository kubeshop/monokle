import {ReactNode} from 'react';

import {DropDownProps, Dropdown, Button as RawButton, Space} from 'antd';

import {DownOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';

import Colors from '@styles/Colors';

type Props = {
  value: string;
  icon: ReactNode;
  tableVisible: boolean;
  table: JSX.Element;
  tablePlacement?: DropDownProps['placement'];
  onTableToggle?: (newVisible: boolean) => void;
};

function TableSelect({value, icon, table, tablePlacement, tableVisible, onTableToggle}: Props) {
  const gitLoading = useAppSelector(state => state.git.loading);

  return (
    <Dropdown
      open={tableVisible}
      onOpenChange={onTableToggle}
      overlay={table}
      placement={tablePlacement}
      arrow
      trigger={['click']}
    >
      <Button loading={gitLoading}>
        <Space>
          {icon}
          <span>{value}</span>
          <DownOutlined style={{fontSize: '75%'}} />
        </Space>
      </Button>
    </Dropdown>
  );
}

export default TableSelect;

const Button = styled(RawButton)`
  border: none;
  border-radius: 4px;
  height: 28px;
  background: ${Colors.grey3b};
  :hover,
  :focus {
    background: ${Colors.grey3b};
    color: ${Colors.lightSeaGreen};
  }
`;
