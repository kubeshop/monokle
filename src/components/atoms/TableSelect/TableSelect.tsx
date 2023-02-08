import {ReactNode} from 'react';

import {DropDownProps, Dropdown, Button as RawButton, Space} from 'antd';

import {DownOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';

import {AnimationDurations} from '@shared/styles';
import {Colors} from '@shared/styles/colors';

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
  const remoteRepo = useAppSelector(state => state.git.repo?.remoteRepo);

  return (
    <Dropdown
      open={tableVisible}
      onOpenChange={onTableToggle}
      menu={{items: [{key: 'table', label: table}]}}
      placement={tablePlacement}
      arrow
      trigger={['click']}
      disabled={remoteRepo?.authRequired}
      overlayClassName="dropdown-custom-styling"
    >
      <Button loading={gitLoading} type="text">
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
  background-color: transparent;

  :hover,
  :focus {
    background-color: transparent;

    span {
      color: ${Colors.geekblue9};
    }
  }

  svg {
    transition: all ${AnimationDurations.base} ease-in;
  }

  span {
    transition: all ${AnimationDurations.base} ease-in;
    color: ${Colors.grey7};
  }
`;
