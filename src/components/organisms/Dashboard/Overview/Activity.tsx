import {useEffect, useRef, useState} from 'react';

import {Button} from 'antd';

import {ArrowDownOutlined, ArrowUpOutlined} from '@ant-design/icons';

import _ from 'lodash';
import {DateTime} from 'luxon';

import {setActiveDashboardMenu, setSelectedResourceId} from '@redux/dashboard';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {timeAgo} from '@utils/timeAgo';

import EventHandler from '@src/kindhandlers/EventHandler';

import {K8sResource} from '@shared/models/k8sResource';

import * as S from './Activity.styled';

export const Activity = ({paused}: {paused?: boolean}) => {
  const dispatch = useAppDispatch();
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const [pausedResource, setPausedResource] = useState<K8sResource | undefined>();
  const [isToLatestVisible, setIsToLatestVisible] = useState<boolean>(false);
  const [isToOldestVisible, setIsToOldestVisible] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [events, setEvents] = useState<K8sResource[]>([]);
  const [tempEventLength, setTempEventLength] = useState(0);

  useEffect(() => {
    if (paused) {
      setPausedResource(events[0]);
    } else {
      setPausedResource(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  useEffect(() => {
    if (scrollPosition > 100) {
      setIsToLatestVisible(true);
    } else {
      setIsToLatestVisible(false);
    }
    if (containerRef && containerRef.current) {
      const scrollableHeight = containerRef.current.scrollHeight - containerRef.current.clientHeight;
      if (scrollableHeight - scrollPosition > 100) {
        setIsToOldestVisible(true);
      } else {
        setIsToOldestVisible(false);
      }
    }
  }, [scrollPosition, containerRef]);

  const handleScroll = (event: any) => {
    setScrollPosition(event.target.scrollTop);
  };

  const handleCloseToLatest = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsToLatestVisible(false);
  };

  const handleCloseToOldest = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsToOldestVisible(false);
  };

  useEffect(() => {
    if (containerRef && containerRef.current && !pausedResource && events.length !== tempEventLength) {
      setScrollPosition(0);
      containerRef.current.scrollTop = 0;
      setTempEventLength(events.length);
    }
    setEvents(
      _.sortBy(
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
      ).reverse()
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceMap, tempEventLength, pausedResource]);

  return (
    <S.Container ref={containerRef} onScroll={handleScroll}>
      {isToLatestVisible && (
        <S.ScrollToLatest>
          <Button
            type="primary"
            onClick={() => {
              if (containerRef && containerRef.current) {
                containerRef.current.scrollTop = 0;
                setScrollPosition(0);
              }
            }}
          >
            <ArrowUpOutlined />
            <span>Up to latest</span>
            <S.CloseOutlined onClick={handleCloseToLatest} />
          </Button>
        </S.ScrollToLatest>
      )}
      {isToOldestVisible && (
        <S.ScrollToOldest>
          <Button
            type="primary"
            onClick={() => {
              if (containerRef && containerRef.current) {
                const position = containerRef.current.scrollHeight - containerRef.current.clientHeight;
                containerRef.current.scrollTop = position;
                setScrollPosition(position);
              }
            }}
          >
            <ArrowDownOutlined />
            <span>Down to oldest</span>
            <S.CloseOutlined onClick={handleCloseToOldest} />
          </Button>
        </S.ScrollToOldest>
      )}
      {events.map(({content, eventTime, id}: K8sResource | any) => (
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
