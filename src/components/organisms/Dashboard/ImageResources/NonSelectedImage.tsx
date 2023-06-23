import {Typography} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles';

const NonSelectedImage = () => {
  return (
    <Container>
      <Title>Working with Images in your cluster</Title>
      <Text>← Click on any of found Images on the left to check out:</Text>

      <UL>
        <li>
          <Text>Provider info: repository/website, version and more.</Text>
        </li>

        <li>
          <Text>Tags with link to full info. Tag search and filter.</Text>
        </li>

        <li>
          <Text>Description and other details.</Text>
        </li>
      </UL>
    </Container>
  );
};

export default NonSelectedImage;

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
