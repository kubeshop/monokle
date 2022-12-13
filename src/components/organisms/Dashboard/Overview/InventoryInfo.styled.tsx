import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 8px 16px;
  font-weight: 400;
`;

export const NodesInformation = styled.div`
  font-size: 14px;
  color: ${Colors.blue7};
`;

export const NodesInformationRow = styled.div`
  line-height: 28px;
  cursor: pointer;
  :hover {
    text-decoration: underline;
  }
`;

export const PercentageText = styled.span`
  color: ${Colors.grey6};
  font-weight: 600;
`;

export const Title = styled.h3`
  font-size: 14px;
  color: ${Colors.grey9};
  line-height: 12px;
`;

export const Description = styled.div`
  font-size: 14px;
  color: ${Colors.grey7};
  line-height: 24px;
`;

export const HorizontalLine = styled.div`
  border: 0.5px solid ${Colors.grey4};
  width: 100%;
  height: 0;
  margin: 18px 0;
`;

export const Link = styled.div`
  color: ${Colors.blue7};
  line-height: 24px;
`;

export const PodsCount = styled.span``;

export const PodsCapacity = styled.span`
  margin-right: 4px;
`;

export const PodsUsagePercentage = styled.span``;

export const ClusterInfoContainer = styled.div``;

export const ClusterInfoRow = styled.div`
  margin: 12px 0;
`;

export const UsefulLinksContainer = styled.div`
  padding: 8px 0 16px 0;
`;
