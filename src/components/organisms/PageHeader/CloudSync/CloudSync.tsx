import {useCallback} from 'react';

import {Button, Dropdown} from 'antd';

import styled from 'styled-components';

import {useCloudPolicy, useCloudUser} from '@redux/validation/validation.hooks';

import CloudIcon from '@assets/CloudIcon.svg';

import {Colors} from '@monokle/components';

const CloudSync = () => {
  const {connect, cloudUser, isConnecting} = useCloudUser();
  const {foundPolicy} = useCloudPolicy();

  const dropdownRender = useCallback(() => {
    if (cloudUser) {
      return (
        <DropdownContent>
          <p>Connected to Monokle Cloud</p>
          <span>
            E-mail: <b>{cloudUser.email}</b>
          </span>
          <p>
            {foundPolicy
              ? 'Monokle Desktop is now using the Policy that was set for this repository in Monokle Cloud.'
              : 'No Policy was found in Monokle Cloud for the current repository.'}
          </p>
        </DropdownContent>
      );
    }
    return (
      <DropdownContent>
        <p>Not connected to Monokle Cloud.</p>
        <Button type="primary" onClick={connect} loading={isConnecting}>
          Connect
        </Button>
      </DropdownContent>
    );
  }, [connect, cloudUser, isConnecting, foundPolicy]);

  return (
    <Container>
      <Dropdown
        trigger={['click']}
        placement="bottom"
        dropdownRender={dropdownRender}
        getPopupContainer={() => document.getElementById('monokleCloudSync')!}
      >
        <Image src={CloudIcon} />
      </Dropdown>
      <div id="monokleCloudSync" />
    </Container>
  );
};

export default CloudSync;

const Container = styled.div`
  display: flex;
  align-items: center;
  border-radius: 4px;
  padding: 0.3rem 0.5rem;
  background: ${Colors.grey3b};
  border: none;
  min-width: fit-content;
`;

const Image = styled.img`
  cursor: pointer;
  height: 20px;
  width: 20px;
`;

const DropdownContent = styled.div`
  padding: 20px;
  margin-top: 10px;
  background-color: ${Colors.grey1};
`;
