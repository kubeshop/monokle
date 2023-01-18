import {useCallback} from 'react';

import _ from 'lodash';
import {DateTime} from 'luxon';

import {K8sResource} from '@models/k8sresource';

import {setActiveDashboardMenu, setSelectedResourceId} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {timeAgo} from '@utils/timeAgo';

import EventHandler from '@src/kindhandlers/EventHandler';

import * as S from './Activity.styled';

export const Activity = () => {
  const dispatch = useAppDispatch();
  const resourceMap = useAppSelector(state => state.main.resourceMap);

  const getEvents = useCallback(() => {
    return _.sortBy(
      Object.values(resourceMap)
        .filter((resource: K8sResource) => resource.filePath.startsWith('preview://'))
        .filter(
          (resource: K8sResource) =>
            resource.content.apiVersion === EventHandler.clusterApiVersion && resource.kind === EventHandler.kind
        )
        .map(resource => ({
          ...resource,
          eventTime:
            resource.content.eventTime || resource.content.deprecatedLastTimestamp || resource.content.lastTimestamp,
        })),
      'eventTime'
    ).reverse();
  }, [resourceMap]);

  return (
    <S.Container>
      {getEvents().map(({content, eventTime, id}: K8sResource | any) => (
        <S.EventRow
          key={content.metadata.uid}
          $type={content.type}
          onClick={() => {
            dispatch(
              setActiveDashboardMenu({
                key: `${EventHandler.clusterApiVersion}-${EventHandler.kind}`,
                label: EventHandler.kind,
              })
            );
            dispatch(setSelectedResourceId(id));
          }}
        >
          <S.TimeInfo>
            <S.MessageTime>{timeAgo(eventTime)}</S.MessageTime>
            <S.MessageCount>
              <span>{content.deprecatedCount || content.count}</span>
              <span> times in the last </span>
              <span>
                {
                  DateTime.fromISO(content.deprecatedLastTimestamp || content.lastTimestamp)
                    .diff(DateTime.fromISO(eventTime), ['hours', 'minutes', 'seconds', 'milliseconds'])
                    .toObject().hours
                }
              </span>
              <span> hours</span>
            </S.MessageCount>
          </S.TimeInfo>
          <S.MessageInfo>
            <S.MessageText>{content.message || content.note}</S.MessageText>
            <S.MessageHost>
              <span>
                {content?.deprecatedSource?.host ||
                  content?.deprecatedSource?.component ||
                  content?.source?.host ||
                  content?.reportingController ||
                  '- '}
                :
              </span>
              <span> {content.metadata.name}</span>
            </S.MessageHost>
          </S.MessageInfo>
          <S.NamespaceInfo>{content.metadata.namespace || '-'}</S.NamespaceInfo>
        </S.EventRow>
      ))}
    </S.Container>
  );
};
