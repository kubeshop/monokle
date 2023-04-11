import {ReactNode} from 'react';

import {Button, Dropdown, Space} from 'antd';

import {DownOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {isInClusterModeSelector, kubeConfigContextSelector} from '@redux/appConfig';
import {useAppSelector} from '@redux/hooks';

import {Colors} from '@shared/styles';

import * as S from '../ClusterSelection.styled';
import {ClusterSelectionTable} from '../ClusterSelectionTable';

export function ContextSelect() {
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);

  return (
    <Dropdown
      menu={{
        items: [
          {
            key: 'form',
            label: <ClusterSelectionTable setIsClusterDropdownOpen={() => {}} />,
          },
        ],
      }}
      overlayClassName="cluster-dropdown-item"
      placement="bottomLeft"
      arrow
      trigger={['hover']}
    >
      <div>
        <Trigger icon={<S.ClusterOutlined />} value={kubeConfigContext} />
      </div>
    </Dropdown>
  );
}

function Trigger({icon, value}: {icon?: ReactNode; value: string}) {
  const isInClusterMode = useAppSelector(isInClusterModeSelector);

  return (
    <TriggerBtn $connected={isInClusterMode}>
      <Space>
        {icon}
        <span>{value}</span>
        <DownOutlined style={{fontSize: '75%'}} />
      </Space>
    </TriggerBtn>
  );
}

const TriggerBtn = styled(Button)<{$connected: boolean}>`
  display: flex;
  align-items: center;
  border-radius: 4px;
  padding: 0 1rem;
  height: 30px;
  background-color: ${({$connected}) => ($connected ? Colors.geekblue7 : Colors.grey3b)};
  color: ${Colors.whitePure};
  border: none;

  &:hover {
    background-color: ${({$connected}) => ($connected ? Colors.geekblue6 : Colors.grey2)};
    color: ${Colors.whitePure};
  }

  &:focus {
    background-color: ${({$connected}) => ($connected ? Colors.geekblue7 : Colors.grey3b)};
    color: ${Colors.whitePure};
  }
`;
