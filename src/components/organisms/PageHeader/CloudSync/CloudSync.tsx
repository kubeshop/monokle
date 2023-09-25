import {useCallback} from 'react';

import {Button, Dropdown, Spin} from 'antd';

import {LoadingOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {useCloudPolicy, useCloudUser} from '@redux/validation/validation.hooks';

import CloudIcon from '@assets/CloudIcon.svg';
import CloudIconWhite from '@assets/CloudIconWhite.svg';

import {Colors} from '@monokle/components';

const LoadingIcon = <LoadingOutlined style={{fontSize: 24}} spin />;

const CloudSync = () => {
  const {connect, cloudUser, isConnecting, isInitializing} = useCloudUser();
  const {cloudPolicy, projectInfo} = useCloudPolicy();

  const dropdownRender = useCallback(() => {
    if (isInitializing) {
      return (
        <DropdownContent>
          <Spin indicator={LoadingIcon} />
          Initializing...
        </DropdownContent>
      );
    }

    if (cloudUser) {
      return (
        <DropdownContent>
          <p>Connected to Monokle Cloud</p>
          <p>
            E-mail: <b>{cloudUser.email}</b>
          </p>
          {cloudPolicy && projectInfo ? (
            <p>
              Project: <b>{projectInfo.name}</b>
            </p>
          ) : (
            <p>Project: Not found</p>
          )}
          <p>
            {cloudPolicy
              ? 'Monokle Desktop is using the Policy from the Monokle Cloud project.'
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
  }, [connect, cloudUser, isConnecting, cloudPolicy, isInitializing, projectInfo]);

  return (
    <Container $hasText={Boolean(projectInfo)} style={{backgroundColor: cloudUser ? Colors.blue7 : ''}}>
      <Dropdown
        trigger={['click']}
        placement="bottom"
        dropdownRender={dropdownRender}
        getPopupContainer={() => document.getElementById('monokleCloudSync')!}
      >
        <div>
          <Image src={cloudUser ? CloudIconWhite : CloudIcon} />
        </div>
      </Dropdown>
      <div id="monokleCloudSync" />
    </Container>
  );
};

export default CloudSync;

const Container = styled.div<{$hasText: boolean}>`
  display: flex;
  align-items: center;
  border-radius: 4px;
  padding: 0 0.5rem;
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

const ProjectName = styled.span`
  margin-left: 4px;
  cursor: pointer;
`;
