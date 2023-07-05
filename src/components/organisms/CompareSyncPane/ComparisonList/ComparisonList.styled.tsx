import {Col, Row, Tag, TagProps} from 'antd';

import {LeftCircleFilled, RightCircleFilled} from '@ant-design/icons';

import styled from 'styled-components';

import {Colors, FontColors} from '@shared/styles/colors';

export const ApiVersionGroup = styled.span`
  font-size: 12px;
  color: ${Colors.grey7};
  margin-left: 6px;
`;

export const HeaderRow = styled(Row)`
  height: 34px;
  font-size: 16px;
  margin-top: 10px;
`;

export const Title = styled.h1<{useCheckboxOffset?: boolean}>`
  padding: 0;
  margin-top: 8px;
  margin-bottom: 0px;
  font-size: 18px;
  line-height: 22px;
`;

export const ComparisonRow = styled(Row)`
  height: 28px;
  font-size: 16px;
  transition: background-color 0.5s;
  padding: 0px 5px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

export const ActionsCol = styled(Col)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ActionsDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
`;

export const ActionsTransferDiv = styled.div`
  display: flex;
  align-items: center;
  width: 25px;
`;

export const ActionsInspectDiv = styled.div`
  width: 50px;
`;

export const RightArrow = styled(RightCircleFilled)`
  font-size: 24px;
  color: ${Colors.blue7};
`;

export const LeftArrow = styled(LeftCircleFilled)`
  font-size: 24px;
  color: ${Colors.blue7};
`;

export const DiffLabel = styled.span`
  color: #1f1f1f;
`;

export const ResourceName = styled.span<{$isActive?: boolean}>`
  font-size: 14px;
  font-weight: 400;
  line-height: 25px;
  color: ${({$isActive = true}) => ($isActive ? Colors.whitePure : Colors.grey5)};
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  cursor: ${({$isActive = true}) => ($isActive ? 'pointer' : 'auto')};
`;

export const ResourceCount = styled.span`
  margin-left: 6px;
  font-size: 14px;
  color: ${FontColors.grey};
`;

export const ResourceDiv = styled.div`
  height: 28px;
  display: flex;
  align-items: center;
`;

type Props = TagProps & {$isActive: boolean};
export const ResourceNamespace = styled((props: Props) => <Tag {...props} />)`
  height: 22px;
  margin: 1px 8px 1px 0px;
  width: 72px;
  text-align: center;
  color: ${props => (props.$isActive ? Colors.whitePure : Colors.grey6)};
  font-size: 12px;
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ResourceNamespacePlaceholder = styled.div`
  height: 22px;
  width: 72px;
  margin-right: 8px;
`;
