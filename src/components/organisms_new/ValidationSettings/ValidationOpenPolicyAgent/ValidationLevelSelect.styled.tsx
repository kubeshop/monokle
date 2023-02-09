import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const Default = styled.span`
  display: block;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 9px;
  margin-left: 3px;
  margin-right: 2px;
  color: ${Colors.grey7};
`;

export const IndicatorBox = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
  gap: 5px;
`;

export const Indicator = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  flex: 0 0 20px;
`;

export const Label = styled.div`
  display: flex;
  gap: 3px;
  align-items: baseline;
  flex: 1 1 auto;
  min-width: 0px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: clip;
`;

export const ProblemIndicator = styled.div<{$level: 'warning' | 'error'}>`
  height: 12px;
  width: 12px;
  background-color: ${({$level}) => ($level === 'warning' ? Colors.yellowWarning : Colors.redError)};
  border-radius: 50%;
`;
