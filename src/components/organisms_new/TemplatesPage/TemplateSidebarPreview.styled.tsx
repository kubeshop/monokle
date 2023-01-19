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
  display: flex;
  flex-direction: column;
  .ant-collapse-header .ant-collapse-header-text {
    color: #fff;
  }
  .ant-collapse {
    border: none;
    display: flex;
    flex-direction: column;
    background: rgba(25, 31, 33, 0.7);
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
        .ant-collapse-content-box {
          display: flex;
        }
      }
    }
  }
  .columns {
    display: inline-flex;
    flex-direction: row;
    margin-top: 40px;
    overflow: hidden;
    @media (max-width: 1210px) {
      display: flex;
      flex-direction: column;
      .column h1 div {
        width: 100%;
      }
    }
    .column {
      display: inline-flex;
      flex-grow: 1;
      width: 100%;
      &.active {
        > span:first-child {
          background: #5273e0;
          color: #141414;
        }
        h1 span {
          background: none;
        }
      }
      &:last-child h1 {
        div[class^='TemplateSidebarPreviewstyled__Divider-'] {
          display: none;
        }
      }
    }
  }
`;

export const StepTitle = styled.p`
  font-size: 16px;
  line-height: 24px;
  color: #dbdbdb;
  flex: none;
  order: 1;
  flex-grow: 1;
  float: left;
  margin-left: 8px;
  margin-top: 4px;
  width: 85%;
  h1 {
    font-size: 16px;
    line-height: 24px;
    width: 100%;
    font-weight: 400;
    float: left;
  }
`;

export const StepSubTitle = styled.p`
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: #7d7d7d;
  order: 0;
  flex-grow: 1;
  width: 100%;
  display: inline-flex;
`;

export const ElipseStepWrapper = styled.span`
  border-radius: 32px;
  order: 0;
  flex-grow: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  width: 32px;
  height: 32px;
  float: left;
  padding: 16px;
  background: #2d3757;
  color: #7d7d7d;
`;

export const Title = styled.h1`
  font-weight: bold;
  align-items: center;
  font-size: 16px;
  line-height: 19px;
  color: #dbdbdb;
  margin-bottom: 4px;
  float: left;
  display: inline-flex;
  width: 85%;
  span {
    float: left;
    width: auto;
    white-space: nowrap;
    display: inline-block;
  }
  div {
    float: left;
    display: inline-flex;
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

export const Divider = styled.div`
  border: 1px solid #303030;
  height: 1px;
  width: 100%;
  margin-left: 16px;
  margin-right: 8px;
  @media (max-width: 1352px) {
    width: 20%;
  }
`;

export const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  .ant-form {
    margin-top: 14px;
  }
  input {
    min-width: 393px;
    max-width: 393px;
    height: 32px;
  }
  .SubmitWrapper {
    margin-top: 57px;
  }
  button {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 16px;
    gap: 8px;
    height: 40px;
    background: #177ddc;
    border-radius: 2px;
    float: left;
  }
  a {
    float: left;
    margin: 9px 33px;
  }
`;
