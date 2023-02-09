import {Typography} from 'antd';

import styled from 'styled-components';

import loadingBar from '@assets/monokleprogressbar.gif';

import {Colors} from '@shared/styles';

const Loading = () => {
  return (
    <Container>
      <Typography.Text>
        <HighlightText>Please wait</HighlightText> while we scan the resources. It’ll take some time but it’s going to
        be amazing!
      </Typography.Text>
      <img src={loadingBar} />
    </Container>
  );
};

export default Loading;

const Container = styled.div`
  height: 100%;
  margin: 8px 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  background-color: ${Colors.black100};

  .ant-typography {
    width: 364px;
    max-width: 80%;
    text-align: center;
    line-height: 24px;
  }
`;

const HighlightText = styled(Typography.Text)`
  color: ${Colors.geekblue8};
`;
