import {useCallback} from 'react';

import {Button, Dropdown, Spin, Tooltip} from 'antd';

import {CheckCircleFilled, CloseCircleFilled, InfoCircleFilled, LoadingOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {TOOLTIP_DELAY} from '@constants/constants';

import {useCloudPolicy, useCloudUser} from '@redux/validation/validation.hooks';

import CloudIcon from '@assets/CloudIcon.svg';
import CloudIconWhite from '@assets/CloudIconWhite.svg';
import CloudSynced from '@assets/CloudSynced.png';
import CloudUnsynced from '@assets/CloudUnsynced.png';

import {Colors} from '@monokle/components';
import {openUrlInExternalBrowser} from '@shared/utils';

const LoadingIcon = <LoadingOutlined style={{fontSize: 24}} spin />;

const CloudSync = () => {
  const {connect, cloudUser, isConnecting, isInitializing} = useCloudUser();
  const {cloudPolicy, projectInfo, policyInfo} = useCloudPolicy();

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
          <Image src={CloudSynced} />
          <Item>
            <span>
              <GreenCircle /> <GreenSpan>Connected</GreenSpan> <GraySpan>to Monokle Cloud</GraySpan>
            </span>
          </Item>
          <Item>
            <Title>
              <GreenCircle /> E-mail
            </Title>
            <Value>{cloudUser.email}</Value>
          </Item>
          <Item>
            <Title>{projectInfo?.name ? <GreenCircle /> : <RedCircle />} Cloud project</Title>
            <Value>
              {projectInfo?.name ? (
                <>
                  <span>{projectInfo?.name}</span>
                  <Info description="The Monokle Cloud project manages this repository." />
                </>
              ) : (
                <>
                  <span>Not found</span>
                  <Info description="No Monokle Cloud Project that manages this repository was found." />
                </>
              )}
            </Value>
          </Item>
          <Item>
            <Title>{cloudPolicy ? <GreenCircle /> : <RedCircle />} Policy</Title>
            <Value>
              {cloudPolicy ? (
                <>
                  <span
                    onClick={() => openUrlInExternalBrowser(policyInfo?.link)}
                    style={{cursor: 'pointer', color: Colors.blue7}}
                  >
                    View project policy
                  </span>
                  <Info description="A Policy is configured for this repository in Monokle Cloud. Your local Policy is in-sync and cannot be changed." />
                </>
              ) : (
                <>
                  <span>Not found</span>
                  <Info description="Couldn't find any Policy configured for this repository." />
                </>
              )}
            </Value>
          </Item>
        </DropdownContent>
      );
    }
    return (
      <DropdownContent>
        <Image src={CloudUnsynced} />
        <Item>
          <span>
            <RedCircle /> <RedSpan>Not Connected</RedSpan> <GraySpan>to Monokle Cloud</GraySpan>
          </span>
        </Item>
        <Button type="primary" onClick={connect} loading={isConnecting}>
          Connect
        </Button>
      </DropdownContent>
    );
  }, [connect, cloudUser, isConnecting, cloudPolicy, isInitializing, projectInfo, policyInfo]);

  return (
    <Container $hasText={Boolean(projectInfo)} style={{cursor: 'pointer'}}>
      <Dropdown
        trigger={['click']}
        placement="bottom"
        dropdownRender={dropdownRender}
        getPopupContainer={() => document.getElementById('monokleCloudSync')!}
      >
        <div>
          <Tooltip
            mouseEnterDelay={TOOLTIP_DELAY}
            title={cloudUser ? 'Connected to Monokle Cloud' : 'Not connected to Monokle Cloud'}
            placement="bottom"
          >
            <Icon src={cloudUser ? CloudIconWhite : CloudIcon} />
            {projectInfo?.name}
          </Tooltip>
        </div>
      </Dropdown>
      <div id="monokleCloudSync" />
    </Container>
  );
};

export default CloudSync;

const Info = (props: {description: string}) => {
  const {description} = props;
  return (
    <Tooltip title={description}>
      <InfoIcon />
    </Tooltip>
  );
};

const Container = styled.div<{$hasText: boolean}>`
  display: flex;
  align-items: center;
  border-radius: 4px;
  padding: 0 0.5rem;
  background: ${Colors.grey3b};
  border: none;
  min-width: fit-content;
`;

const Icon = styled.img`
  cursor: pointer;
  height: 20px;
  width: 20px;
  margin-right: 4px;
`;

const Image = styled.img`
  margin-bottom: 8px;
  margin-left: -4px;
`;

const DropdownContent = styled.div`
  padding: 28px;
  margin-top: 10px;
  background-color: ${Colors.grey2};
`;

const GreenSpan = styled.span`
  color: ${Colors.polarGreen};
`;

const RedSpan = styled.span`
  color: ${Colors.red7};
`;

const GraySpan = styled.span`
  color: ${Colors.grey7};
`;

const GreenCircle = styled(CheckCircleFilled)`
  font-size: 12px;
  color: ${Colors.polarGreen};
  margin-right: 4px;
`;

const RedCircle = styled(CloseCircleFilled)`
  font-size: 12px;
  color: ${Colors.red7};
  margin-right: 4px;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const Title = styled.div`
  width: 120px;
  margin-right: 8px;
  color: ${Colors.grey7};
`;

const Value = styled.div`
  flex: 1;
  text-align: left;
  margin-left: 8px;
`;

const InfoIcon = styled(InfoCircleFilled)`
  color: ${Colors.grey6};
  margin-left: 8px;
  cursor: pointer;
`;
