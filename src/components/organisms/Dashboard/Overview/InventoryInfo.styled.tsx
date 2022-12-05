import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  padding: 16px;
  font-weight: 400;
`;

export const NodesInformation = styled.div`
  font-size: 14px;
  color: ${Colors.blue7};
`;

export const NodesInformationRow = styled.div`
  line-height: 28px;
`;

export const PercentageText = styled.span`
  color: ${Colors.grey6};
  font-weight: 600;
`;

export const Title = styled.h3`
  font-size: 14px;
  color: ${Colors.grey9};
  line-height: 24px;
`;

export const Description = styled.div`
  font-size: 14px;
  color: ${Colors.grey7};
  line-height: 24px;
`;

export const HorizontalLine = styled.div`
  border: 1px solid ${Colors.grey4};
  width: 100%;
  height: 0;
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

export const ClusterAPIContainer = styled.div``;

export const UsefulLinksContainer = styled.div``;
