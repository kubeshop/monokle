import {useEffect, useState} from 'react';
import {useInterval} from 'react-use';

import {DateTime} from 'luxon';

import {useAppSelector} from '@redux/hooks';
import {ClusterEvent, getClusterEvents} from '@redux/services/clusterDashboard';
import {KubeConfigManager} from '@redux/services/kubeConfigManager';

import * as S from './Activity.styled';

export const Activity = () => {
  const [activityData, setActivityData] = useState<ClusterEvent[]>([]);
  const selectedNamespace = useAppSelector(state => state.dashboard.ui.selectedNamespace);
  const [heartbeat, setHeartbeat] = useState(0);

  useEffect(() => {
    const k8sApiClient = new KubeConfigManager().getV1ApiClient();

    if (k8sApiClient) {
      getClusterEvents(k8sApiClient, selectedNamespace === 'ALL' ? undefined : selectedNamespace)
        .then((events: ClusterEvent[]) => {
          setActivityData(events);
        })
        .catch(() => setActivityData([]));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [new KubeConfigManager().kubeConfig, heartbeat, selectedNamespace]);

  useInterval(() => {
    setHeartbeat(heartbeat + 1);
  }, 5000);

  return (
    <S.Container>
      {activityData.map(event => (
        <S.EventRow key={event.metadata.uid} $type={event.type}>
          <S.TimeInfo>
            <S.MessageTime>{DateTime.fromJSDate(event.lastTimestamp).toRelative()}</S.MessageTime>
            <S.MessageCount>
              <span>{event.count}</span>
              <span> times in the last </span>
              <span>
                {
                  DateTime.fromJSDate(event.lastTimestamp)
                    .diff(DateTime.fromJSDate(event.metadata.creationTimestamp), [
                      'hours',
                      'minutes',
                      'seconds',
                      'milliseconds',
                    ])
                    .toObject().hours
                }
              </span>
              <span> hours</span>
            </S.MessageCount>
          </S.TimeInfo>
          <S.MessageInfo>
            <S.MessageText>{event.message}</S.MessageText>
            <S.MessageHost>
              {event.source.host || '- '}: {event.metadata.name}
            </S.MessageHost>
          </S.MessageInfo>
          <S.NamespaceInfo>{event.metadata.namespace || '-'}</S.NamespaceInfo>
        </S.EventRow>
      ))}
    </S.Container>
  );
};
