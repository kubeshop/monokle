import {CloudUploadOutlined as RawCloudUploadOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';
import {Device} from '@shared/styles/device';

export const CloudUploadOutlined = styled(RawCloudUploadOutlined)`
  font-size: 16px;
`;

export const Description = styled.div`
  color: ${Colors.grey8};
  margin-bottom: 50px;
`;

export const HelpfulResourcesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  grid-auto-rows: 100px;
  grid-gap: 15px;
`;

export const LearnCardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-auto-rows: 250px;
  grid-column-gap: 30px;
  grid-row-gap: 20px;
`;

export const LearnPageContainer = styled.div`
  @media ${Device.laptopM} {
    padding-right: 150px;
  }
`;

export const SubTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  margin: 40px 0px 30px 0px;
`;
