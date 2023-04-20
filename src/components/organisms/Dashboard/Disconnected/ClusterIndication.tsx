import styled from 'styled-components';

import ClusterIndicationSvg from '@assets/ClusterIndicationPlain.svg';

import {Colors} from '@shared/styles';

export function ClusterIndication() {
  return (
    <Box>
      <Content>
        <div>Click here to connect from anywhere in the app</div>
      </Content>
      <Image alt="Cluster Indication" src={ClusterIndicationSvg} />
    </Box>
  );
}

const Box = styled.div`
  position: absolute;
  display: flex;
  gap: 12px;
  right: 128px;
`;

const Content = styled.div`
  width: 200px;
  height: 100px;
  color: ${Colors.grey7};
  display: flex;
  flex-direction: column-reverse;
  text-align: right;
`;

const Image = styled.img<{$right?: number}>`
  width: 66px;
  min-width: 66px;
`;
