import {useCallback} from 'react';

import _ from 'lodash';
import {DateTime} from 'luxon';

import {K8sResource} from '@models/k8sresource';

import {useAppSelector} from '@redux/hooks';

import {timeAgo} from '@utils/timeAgo';

import EventHandler from '@src/kindhandlers/EventHandler';

import * as S from './Activity.styled';

export const Activity = () => {
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedNamespace = useAppSelector(state => state.dashboard.ui.selectedNamespace);

  const getEvents = useCallback(() => {
    return _.sortBy(
      Object.values(resourceMap)
        .filter((resource: K8sResource) => resource.filePath.startsWith('preview://'))
        .filter(
          (resource: K8sResource) =>
            resource.content.apiVersion === EventHandler.clusterApiVersion &&
            resource.kind === EventHandler.kind &&
            (selectedNamespace !== 'ALL' && Boolean(resource.namespace)
              ? selectedNamespace === resource.namespace
              : true)
        ),
      'content.lastTimestamp'
    )
      .filter(i => Boolean(i.content.count) && Boolean(i.content.source.host))
      .reverse();
  }, [resourceMap, selectedNamespace]);

  return (
    <S.Container>
      {getEvents().map(({content}: K8sResource) => (
        <S.EventRow key={content.metadata.uid} $type={content.type}>
          <S.TimeInfo>
            <S.MessageTime>{timeAgo(content.lastTimestamp)}</S.MessageTime>
            <S.MessageCount>
              <span>{content.count}</span>
              <span> times in the last </span>
              <span>
                {
                  DateTime.fromISO(content.lastTimestamp)
                    .diff(DateTime.fromISO(content.metadata.creationTimestamp), [
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
            <S.MessageText>{content.message}</S.MessageText>
            <S.MessageHost>
              {content.source.host || '- '}: {content.metadata.name}
            </S.MessageHost>
          </S.MessageInfo>
          <S.NamespaceInfo>{content.metadata.namespace || '-'}</S.NamespaceInfo>
        </S.EventRow>
      ))}
    </S.Container>
  );
};
