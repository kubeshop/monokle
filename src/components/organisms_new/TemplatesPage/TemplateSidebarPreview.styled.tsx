import {Button as AntdButton} from 'antd';

import styled from 'styled-components';

import {Icon as BaseIcon} from '@atoms';

import {Colors} from '@shared/styles/colors';

export const DetailsColumn = styled.div`
  font-size: 13px;
  line-height: 22px;
  color: #acacac;
  float: left;
  width: 310px;
  text-align: left;
  margin-left: 15px;
  padding-bottom: 30px;
  p {
    margin-bottom: 0;
  }
  h5 {
    font-size: 13px;
    margin-bottom: 0;
  }
`;

export const DetailsHeader = styled.p`
  display: flex;
  margin: 0;
  h5 {
    margin-left: 5px;
    color: #acacac;
  }
  span {
    color: #7d7d7d;
  }
`;
export const ResourcesColumn = styled.div`
  float: left;
  width: 306px;
  text-align: left;
  padding-bottom: 30px;
  margin-left: 45px;
`;

export const TemplateSidebar = styled.div`
  flex-grow: 1;
  .ant-collapse-header .ant-collapse-header-text {
    color: #fff;
  }
  .ant-collapse {
    border: none;
    .ant-collapse-item {
      color: #acacac;
      border-bottom: 0;
      .ant-collapse-expand-icon {
        color: #177ddc;
        position: absolute;
        right: 0;
      }
      .ant-collapse-content {
        border-top: 0;
      }
    }
  }
`;

export const Icon = styled(BaseIcon)`
  font-size: 32px;
`;

export const Name = styled.h1`
  color: ${Colors.whitePure};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 6px;
  margin-bottom: 6px;
  font-size: 16px;
`;

export const Description = styled.span`
  color: ${Colors.grey8};
`;

export const Link = styled.a`
  color: ${Colors.blue7};
`;

export const Button = styled(AntdButton)`
  color: ${Colors.whitePure};
  background-color: ${Colors.blue7};
  margin-top: 10px;
  display: block;
`;

export const ReadMoreStyled = styled.p`
  display: inline;
  width: 100%;
  color: #acacac;
  .container {
    position: absolute;
    top: 10%;
    left: 23%;
    width: 50%;
  }
  .read-or-hide {
    cursor: pointer;
  }
`;

export const ResourcesRefLink = styled.h5`
  a {
    color: #b2f1e8;
  }
  font-size: 13px;
  line-height: 22px;
  margin: 0;
`;
