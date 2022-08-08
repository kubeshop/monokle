import {useCallback} from 'react';

import {Tooltip} from 'antd';

import {DateTime} from 'luxon';

import {ItemCustomComponentProps} from '@models/navigator';

import {useAppSelector} from '@redux/hooks';

import * as S from './ResourceKindInformation.styled';

export const ResourceKindInformation = (props: ItemCustomComponentProps) => {
  const {itemInstance} = props;
  const resource = useAppSelector(state => state.main.resourceMap[itemInstance.id]);

  const getInformation = useCallback(() => {
    let text;
    if (resource && resource.content && resource.content.metadata) {
      text = DateTime.fromISO(resource.content.metadata.creationTimestamp).toRelative()?.replace(' ago', '');
    }

    if (text) {
      text = `${text} | `;
    }

    if (resource.content?.status?.phase) {
      text = `${text}${resource.content.status.phase}`;
    }
    return text;
  }, [resource]);

  if (!resource) {
    return null;
  }

  return getInformation() ? (
    <Tooltip placement="top" title={getInformation()}>
      <S.InfoCircleOutlined $isSelected={itemInstance.isSelected} />
    </Tooltip>
  ) : null;
};
