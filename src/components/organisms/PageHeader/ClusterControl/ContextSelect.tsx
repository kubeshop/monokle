import {ReactNode, useCallback} from 'react';

import {Button, Dropdown} from 'antd';

import {DownOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {isInClusterModeSelector} from '@redux/appConfig';
import {selectKubeconfig} from '@redux/cluster/selectors';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setLeftMenuSelection} from '@redux/reducers/ui';

import {Icon} from '@monokle/components';
import {Colors} from '@shared/styles';

import {ClusterSelectionTable} from '../ClusterSelectionTable';

export function ContextSelect() {
  const kubeconfig = useAppSelector(selectKubeconfig);

  if (!kubeconfig?.isValid) {
    return <InvalidKubeconfigButton />;
  }

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
        <Trigger
          icon={<Icon name="cluster-dashboard" style={{fontSize: '14px', marginTop: 4}} />}
          value={kubeconfig.currentContext}
        />
      </div>
    </Dropdown>
  );
}

function Trigger({icon, value}: {icon?: ReactNode; value: string}) {
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const hasNoCurrentContext = value === '';

  return (
    <TriggerBtn $connected={isInClusterMode}>
      <Spacer>
        {icon}
        <TriggerContent>{hasNoCurrentContext ? 'no context selected' : value}</TriggerContent>
        <DownOutlined style={{fontSize: '75%'}} />
      </Spacer>
    </TriggerBtn>
  );
}

const TriggerBtn = styled(Button)<{$connected?: boolean}>`
  display: flex;
  flex: 0 1 auto;
  overflow: hidden;
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

function InvalidKubeconfigButton() {
  const dispatch = useAppDispatch();

  const handleClick = useCallback(() => {
    dispatch(setLeftMenuSelection('dashboard'));
  }, [dispatch]);

  return (
    <TriggerBtn onClick={handleClick}>
      <Spacer>
        <Icon name="cluster-dashboard" style={{fontSize: '14px', marginTop: 4}} />
        <span>no cluster found</span>
      </Spacer>
    </TriggerBtn>
  );
}

const Spacer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TriggerContent = styled.div`
  max-width: 380px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;
