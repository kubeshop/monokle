import {Button, Skeleton as RawSkeleton} from 'antd';

import {RightOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {Colors} from '@shared/styles';

export const TemplatesPageContainer = styled.div`
  height: 100%;
  display: inline-block;
`;

export const TemplateLeftSidebarWrapper = styled.div`
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

export const Arrow = styled(RightOutlined)`
  font-size: 8px;
  cursor: pointer;
  width: 8px;
  align-self: center;
`;

export const Content = styled.div`
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
`;

export const Form = styled.div`
  margin: 5px 0;
`;

export const SearchBox = styled.div`
  display: flex;
  margin: 12px 0;
  //width: 406px;
  //height: 32px;

  input {
    border-width: 0;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
`;

export const StyledButton = styled(Button)<{$isItemSelected: boolean}>`
  display: flex;
  justify-content: center;
  width: 32px;
  margin-left: 8px;
  ${({$isItemSelected}) => `background-color: ${$isItemSelected ? Colors.blue6 : Colors.grey6};`}
  border-width: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;

  &:hover {
    color: ${Colors.whitePure};
    ${({$isItemSelected}) => `background-color: ${$isItemSelected ? Colors.blue6 : Colors.grey6};`};
    ${({$isItemSelected}) => `border-color: ${$isItemSelected ? Colors.grey5b : Colors.lightSeaGreen};`}
  }

  &:focus {
    color: ${Colors.whitePure};
    ${({$isItemSelected}) => `background-color: ${$isItemSelected ? Colors.blue6 : Colors.grey6};`};
    border-color: transparent;
  }

  :nth-child(3) {
    span {
      transform: rotate(-90deg);
      position: absolute;
      top: 8px;
      left: 13px;
    }
  }
  span {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
`;
