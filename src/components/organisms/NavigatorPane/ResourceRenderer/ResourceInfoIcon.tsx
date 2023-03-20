import {useMemo} from 'react';

import {Tooltip} from 'antd';

import {DateTime} from 'luxon';

import {useResourceContent} from '@redux/selectors/resourceSelectors';

import {ResourceMeta} from '@shared/models/k8sResource';

import * as S from './ResourceInfoIcon.styled';

type Props = {
  resourceMeta: ResourceMeta;
  isSelected: boolean;
};

export const ResourceInfoIcon = (props: Props) => {
  const {resourceMeta, isSelected} = props;

  const resourceContent = useResourceContent(resourceMeta);

  const ageInfo = useMemo(() => {
    if (!resourceContent?.object?.metadata) {
      return '';
    }

    return DateTime.fromISO(resourceContent.object.metadata.creationTimestamp).toRelative()?.replace(' ago', '');
  }, [resourceContent]);

  const statusInfo = useMemo(() => {
    if (!resourceContent?.object?.status?.phase) {
      return '';
    }

    return resourceContent.object.status.phase;
  }, [resourceContent]);

  if (!resourceContent || (!ageInfo && !statusInfo)) {
    return null;
  }

  return (
    <Tooltip
      placement="top"
      title={
        <S.InfoContainer>
          {ageInfo && (
            <>
              Age <S.Tag>{ageInfo}</S.Tag>
            </>
          )}

          {ageInfo && statusInfo && '|'}

          {statusInfo && (
            <>
              <span>Status</span> <S.Tag $status={statusInfo}>{statusInfo}</S.Tag>
            </>
          )}
        </S.InfoContainer>
      }
    >
      <S.InfoCircleFilled $isSelected={isSelected} />
    </Tooltip>
  );
};
