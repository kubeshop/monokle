import {useCallback} from 'react';

import _ from 'lodash';
import {DateTime} from 'luxon';

import {useAppSelector} from '@redux/hooks';

import {timeAgo} from '@utils/timeAgo';

import EventHandler from '@src/kindhandlers/EventHandler';

import {K8sResource} from '@shared/models/k8sResource';

import * as S from './Activity.styled';

export const Activity = () => {
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedNamespaces = useAppSelector(state => state.dashboard.ui.selectedNamespaces);

  const getEvents = useCallback(() => {
    return _.sortBy(
      Object.values(resourceMap)
        .filter((resource: K8sResource) => resource.filePath.startsWith('preview://'))
        .filter(
          (resource: K8sResource) =>
            resource.content.apiVersion === EventHandler.clusterApiVersion &&
            resource.kind === EventHandler.kind &&
            (selectedNamespaces.length > 0 && Boolean(resource.namespace)
              ? selectedNamespaces.find(n => n === resource.namespace)
              : true)
        )
        .map(resource => ({
          ...resource,
          eventTime:
            resource.content.eventTime || resource.content.deprecatedLastTimestamp || resource.content.lastTimestamp,
        })),
      'eventTime'
    ).reverse();
  }, [resourceMap, selectedNamespaces]);

  return (
    <S.Container>
      {getEvents().map(({content, eventTime}: K8sResource | any) => (
        <S.EventRow key={content.metadata.uid} $type={content.type}>
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
