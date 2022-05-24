import {Col, Row, Tag, TagProps} from 'antd';

import {LeftCircleFilled, RightCircleFilled} from '@ant-design/icons';

import styled from 'styled-components';

import Colors, {FontColors} from '@styles/Colors';

export const HeaderRow = styled(Row)`
  height: 34px;
  margin-left: 8px;
  font-size: 16px;
`;

export const Title = styled.h1<{useCheckboxOffset?: boolean}>`
  padding: 0;
  margin-top: 8px;
  margin-left: ${props => (props.useCheckboxOffset ? '32px' : 0)};
  margin-bottom: 0px;
  font-size: 18px;
  line-height: 22px;
`;

export const ComparisonRow = styled(Row)`
  height: 28px;
  margin-left: 8px;
  font-size: 16px;
`;

export const ComparisonActionsCol = styled(Col)`
  display: flex;
  align-items: center;
  justify-content: center;
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
  color: ${({$isActive = true}) => ($isActive ? Colors.whitePure : Colors.grey5b)};
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
