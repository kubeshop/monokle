import {PullRequestOutlined as RawPullRequestOutlined, StarFilled as RawStarFilled} from '@ant-design/icons';

import styled from 'styled-components';

import {AppBorders} from '@styles/Borders';
import Colors from '@styles/Colors';

export const ImageDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 10px;
`;

export const ImageExtraInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const ImageName = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${Colors.cyan7};
  border-bottom: ${AppBorders.sectionDivider};
  padding: 10px;

  display: flex;
  align-items: center;
  gap: 10px;
`;

export const PullRequestOutlined = styled(RawPullRequestOutlined)`
  font-size: 16px;
  margin-right: -5px;
`;

export const SectionContainer = styled.div`
  font-size: 14px;
`;

export const SectionTitle = styled.h3`
  font-weight: bold;
`;

export const StarFilled = styled(RawStarFilled)`
  font-size: 16px;
  margin-right: -5px;
  color: ${Colors.yellow6};
`;
