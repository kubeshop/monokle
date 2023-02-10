import {useMemo} from 'react';

import {Tooltip} from 'antd';

import {DateTime} from 'luxon';

import {useAppSelector} from '@redux/hooks';
import {resourceContentSelector} from '@redux/selectors/resourceSelectors';

import {ItemCustomComponentProps} from '@shared/models/navigator';

import * as S from './ResourceKindInformation.styled';

export const ResourceKindInformation = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;
  const resourceContent = useAppSelector(state =>
    resourceContentSelector(state, {id: itemInstance.id, storage: itemInstance.meta?.resourceStorage})
  );

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
      <S.InfoCircleFilled $isSelected={itemInstance.isSelected} />
    </Tooltip>
  );
};
