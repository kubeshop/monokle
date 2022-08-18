import {useMemo} from 'react';

import {Tooltip} from 'antd';

import {DateTime} from 'luxon';

import {ItemCustomComponentProps} from '@models/navigator';

import {useAppSelector} from '@redux/hooks';

import * as S from './ResourceKindInformation.styled';

export const ResourceKindInformation = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;
  const resource = useAppSelector(state => state.main.resourceMap[itemInstance.id]);

  const ageInfo = useMemo(() => {
    if (!resource?.content?.metadata) {
      return '';
    }

    return DateTime.fromISO(resource.content.metadata.creationTimestamp).toRelative()?.replace(' ago', '');
  }, [resource]);

  const statusInfo = useMemo(() => {
    if (!resource?.content?.status?.phase) {
      return '';
    }

    return resource.content.status.phase;
  }, [resource]);

  if (!resource || (!ageInfo && !statusInfo)) {
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
