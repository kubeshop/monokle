import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {Button} from 'antd';

import {ArrowDownOutlined, ArrowUpOutlined} from '@ant-design/icons';

import {sortBy} from 'lodash';
import {DateTime} from 'luxon';
import {Merge} from 'type-fest';

import {setActiveDashboardMenu, setDashboardSelectedResourceId} from '@redux/dashboard';
import {useAppDispatch} from '@redux/hooks';
import {useResourceMap} from '@redux/selectors/resourceMapSelectors';

import {useStateWithRef} from '@utils/hooks';
import {timeAgo} from '@utils/timeAgo';

import EventHandler from '@src/kindhandlers/EventHandler';

import {K8sResource} from '@shared/models/k8sResource';

import * as S from './Activity.styled';

export const Activity = ({paused}: {paused?: boolean}) => {
  const dispatch = useAppDispatch();
  const clusterResourceMap = useResourceMap('cluster');
  const [isToLatestVisible, setIsToLatestVisible] = useState<boolean>(false);
  const [isToOldestVisible, setIsToOldestVisible] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [events, setEvents, eventsRef] = useStateWithRef<Merge<K8sResource, {eventTime: string}>[]>([]);
  const [tempEventLength, setTempEventLength] = useState(0);

  const pausedResource = useMemo<K8sResource | undefined>(() => {
    if (paused) {
      return eventsRef.current[0];
    }
    return undefined;
  }, [paused, eventsRef]);

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

  const handleScroll = useCallback(
    () => (event: any) => {
      setScrollPosition(event.target.scrollTop);
    },
    []
  );

  const handleCloseToLatest = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsToLatestVisible(false);
  }, []);

  const handleCloseToOldest = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsToOldestVisible(false);
  }, []);

  useEffect(() => {
    if (containerRef && containerRef.current && !pausedResource && eventsRef.current.length !== tempEventLength) {
      setScrollPosition(0);
      containerRef.current.scrollTop = 0;
      setTempEventLength(eventsRef.current.length);
    }
    setEvents(
      sortBy(
        Object.values(clusterResourceMap)
          .filter(
            resource =>
              resource.object.apiVersion === EventHandler.clusterApiVersion && resource.kind === EventHandler.kind
          )
          .map(resource => ({
            ...resource,
            eventTime:
              resource.object.eventTime || resource.object.deprecatedLastTimestamp || resource.object.lastTimestamp,
          })),
        'eventTime'
      ).reverse()
    );
  }, [clusterResourceMap, tempEventLength, pausedResource, setEvents, eventsRef]);

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
      {events.map(({object, eventTime, id}) => (
        <S.EventRow
          key={object.metadata.uid}
          $type={object.type}
          onClick={() => {
            dispatch(
              setActiveDashboardMenu({
                key: `${EventHandler.clusterApiVersion}-${EventHandler.kind}`,
                label: EventHandler.kind,
              })
            );
            dispatch(setDashboardSelectedResourceId(id));
          }}
        >
          <S.TimeInfo>
            <S.MessageTime>{timeAgo(eventTime)}</S.MessageTime>
            <S.MessageCount>
              <span>{object.deprecatedCount || object.count}</span>
              <span> times in the last </span>
              <span>
                {
                  DateTime.fromISO(object.deprecatedLastTimestamp || object.lastTimestamp)
                    .diff(DateTime.fromISO(eventTime), ['hours', 'minutes', 'seconds', 'milliseconds'])
                    .toObject().hours
                }
              </span>
              <span> hours</span>
            </S.MessageCount>
          </S.TimeInfo>
          <S.MessageInfo>
            <S.MessageText>{object.message || object.note}</S.MessageText>
            <S.MessageHost>
              <span>
                {object?.deprecatedSource?.host ||
                  object?.deprecatedSource?.component ||
                  object?.source?.host ||
                  object?.reportingController ||
                  '- '}
                :
              </span>
              <span> {object.metadata.name}</span>
            </S.MessageHost>
          </S.MessageInfo>
          <S.NamespaceInfo>{object.metadata.namespace || '-'}</S.NamespaceInfo>
        </S.EventRow>
      ))}
    </S.Container>
  );
};
