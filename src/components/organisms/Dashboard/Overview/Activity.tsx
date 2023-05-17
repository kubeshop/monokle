import {useEffect, useMemo, useRef, useState} from 'react';

import {Button} from 'antd';

import {ArrowDownOutlined, ArrowUpOutlined} from '@ant-design/icons';

import {sortBy} from 'lodash';
import {DateTime} from 'luxon';
import {Merge} from 'type-fest';

import {setActiveDashboardMenu, setDashboardSelectedResourceId} from '@redux/dashboard';
import {useAppDispatch} from '@redux/hooks';
import {useResourceContentMap} from '@redux/selectors/resourceMapSelectors';

import {useStateWithRef} from '@utils/hooks';
import {timeAgo} from '@utils/timeAgo';

import EventHandler from '@src/kindhandlers/EventHandler';

import {ResourceContent} from '@shared/models/k8sResource';
import {trackEvent} from '@shared/utils';
import {elementScroll, useVirtualizer} from '@tanstack/react-virtual';

import * as S from './Activity.styled';

const ROW_HEIGHT = 80;

export const Activity = ({paused}: {paused?: boolean}) => {
  const dispatch = useAppDispatch();
  const clusterResourceContentMap = useResourceContentMap('cluster');
  const [isToLatestVisible, setIsToLatestVisible] = useState<boolean>(false);
  const [isToOldestVisible, setIsToOldestVisible] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [events, setEvents, eventsRef] = useStateWithRef<Merge<ResourceContent, {eventTime: string}>[]>([]);
  const [tempEventLength, setTempEventLength] = useState(0);

  const rowVirtualizer = useVirtualizer({
    count: events.length,
    estimateSize: () => ROW_HEIGHT,
    getScrollElement: () => containerRef.current,
    scrollToFn: elementScroll,
  });

  const pausedResource = useMemo<ResourceContent | undefined>(() => {
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

  const handleScroll = () => (event: any) => {
    setScrollPosition(event.target.scrollTop);
    setIsToLatestVisible(false);
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
    if (containerRef && containerRef.current && !pausedResource && eventsRef.current.length !== tempEventLength) {
      setScrollPosition(0);
      containerRef.current.scrollTop = 0;
      setTempEventLength(eventsRef.current.length);
    }
    setEvents(
      sortBy(
        Object.values(clusterResourceContentMap)
          .filter(
            resource =>
              resource.object.apiVersion === EventHandler.clusterApiVersion &&
              resource.object.kind === EventHandler.kind
          )
          .map(resource => ({
            ...resource,
            eventTime:
              resource.object.eventTime || resource.object.deprecatedLastTimestamp || resource.object.lastTimestamp,
          })),
        'eventTime'
      )
        .reverse()
        .slice(0, 100)
    );
  }, [clusterResourceContentMap, tempEventLength, pausedResource, setEvents, eventsRef]);

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
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualItem => {
          const {object, eventTime, id} = events[virtualItem.index];
          return (
            <S.VirtualItem
              key={virtualItem.key}
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
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
                  trackEvent('dashboard/select_event');
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
            </S.VirtualItem>
          );
        })}
      </div>
    </S.Container>
  );
};
