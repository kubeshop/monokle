import {DateTime} from 'luxon';

import {ClusterEvent} from '@redux/services/clusterDashboard';

import * as S from './Activity.styled';

export const Activity = ({events}: {events: ClusterEvent[]}) => {
  return (
    <S.Container>
      {events.map(event => (
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
              {event.source.host || '-'}: {event.metadata.name}
            </S.MessageHost>
          </S.MessageInfo>
          <S.NamespaceInfo>{event.metadata.namespace || '-'}</S.NamespaceInfo>
        </S.EventRow>
      ))}
    </S.Container>
  );
};
