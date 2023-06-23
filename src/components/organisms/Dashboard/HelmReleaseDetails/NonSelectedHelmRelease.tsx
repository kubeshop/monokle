import {Typography} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles';

const NonSelectedHelmRelease = () => {
  return (
    <Container>
      <Title>
        Working with <b>Helm</b> in your cluster
      </Title>
      <Text>
        ← Manage here everyting related to Helm Charts in your cluster. Click on any of found Chart releases on the left
        to:
      </Text>

      <UL>
        <li>
          <Text>Check out update history and update to latest versions.</Text>
        </li>
        <li>
          <Text>Dry-run a release.</Text>
        </li>
      </UL>
    </Container>
  );
};

export default NonSelectedHelmRelease;

const Container = styled.div`
  border: 1px solid ${Colors.grey4};
  margin: 24px;
  padding: 24px;
`;

const Title = styled(Typography.Title)`
  &.ant-typography {
    color: ${Colors.geekblue8};
    font-weight: 400;
    font-size: 24px;
    line-height: 32px;
    margin-bottom: 24px;
  }
`;

const Text = styled(Typography.Text)`
  &.ant-typography {
    font-weight: 400;
    font-size: 14px;
    line-height: 24px;

    color: ${Colors.grey8};
  }
`;

const UL = styled.ul`
  li::marker {
    font-size: 14px;
    line-height: 24px;

    color: ${Colors.grey8};
  }
`;
