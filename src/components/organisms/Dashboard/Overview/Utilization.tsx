import {useEffect, useState} from 'react';

import {NodeMetric} from '@redux/services/clusterDashboard';

import {convertBytesToGigabyte} from '@utils/unit-converter';

import InfoCircle from '@assets/InfoCircle.svg';

import {Colors} from '@shared/styles/colors';

import * as S from './Utilization.styled';

export const Utilization = ({utilizations}: {utilizations: NodeMetric[]}) => {
  const [averageCpuUsage, setAverageCpuUsage] = useState(0);
  const [totalCpu, setTotalCpu] = useState(0);
  const [averageMemoryUsage, setAverageMemoryUsage] = useState(0);
  const [totalMemory, setTotalMemory] = useState(0);

  useEffect(() => {
    setTotalCpu(utilizations.reduce((total, u) => u.cpuCapacity + total, 0));
    setAverageCpuUsage(utilizations.reduce((total, u) => u.cpuUsage + total, 0));
    setTotalMemory(utilizations.reduce((total, u) => u.memoryCapacity + total, 0));
    setAverageMemoryUsage(utilizations.reduce((total, u) => u.memoryUsage + total, 0));
  }, [utilizations]);

  return (
    <S.Container>
      <S.Utilization>
        <S.ProgressContainer>
          <S.Progress
            strokeColor={Colors.geekblue7}
            percent={(averageCpuUsage / totalCpu) * 100}
            status="active"
            strokeWidth={20}
            showInfo={false}
            strokeLinecap="round"
          />
        </S.ProgressContainer>
        <S.InformationContainer>
          <S.InfoTitle>
            <span>CPU</span>
            <S.InfoIcon src={InfoCircle} width={14} />
          </S.InfoTitle>
          <S.InfoDescription>
            <span>{(averageCpuUsage / 1000).toFixed(2)}</span>
            <span> / </span>
            <span>{(totalCpu / 1000).toFixed(2)}</span>
          </S.InfoDescription>
        </S.InformationContainer>
      </S.Utilization>
      <S.Utilization>
        <S.ProgressContainer>
          <S.Progress
            strokeColor={Colors.geekblue7}
            percent={(averageMemoryUsage / totalMemory) * 100}
            status="active"
            strokeWidth={20}
            showInfo={false}
            strokeLinecap="round"
          />
        </S.ProgressContainer>
        <S.InformationContainer>
          <S.InfoTitle>
            <span>Memory</span>
            <S.InfoIcon src={InfoCircle} width={14} />
          </S.InfoTitle>
          <S.InfoDescription>
            <span>{convertBytesToGigabyte(averageMemoryUsage)}</span>
            <span> / </span>
            <span>{convertBytesToGigabyte(totalMemory)} GB</span>
          </S.InfoDescription>
        </S.InformationContainer>
      </S.Utilization>
    </S.Container>
  );
};
