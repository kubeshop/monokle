import {Skeleton as RawSkeleton} from 'antd';

import {RightOutlined} from '@ant-design/icons';

import styled from 'styled-components';

export const TemplatesPageContainer = styled.div`
  height: 100%;
  margin: 0 39px;
  display: inline-block;
`;

export const Skeleton = styled(RawSkeleton)`
  margin: 20px;
  width: 90%;
`;

export const TemplatesListWrapper = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 10px;
`;

export const TemplateSidebarPreviewWrapper = styled.div`
  margin-top: 40px;
  display: flex;
  gap: 10px;
`;

export const TemplatesPageTitle = styled.h1`
  font-size: 16px;
  font-weight: 700;
  line-height: 22px;
  letter-spacing: 0;
  text-align: left;
  margin-top: 33px;
  margin-bottom: 20px;
`;

export const TemplatesPageSubTitle = styled.h3`
  letter-spacing: 0;
  text-align: left;
  margin-bottom: 36px;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: #acacac;
  max-width: 626px;
`;

export const Arrow = styled(RightOutlined)`
  font-size: 8px;
  cursor: pointer;
  width: 8px;
  align-self: center;
`;
