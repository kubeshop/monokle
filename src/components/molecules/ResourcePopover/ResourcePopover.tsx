import {ReactNode} from 'react';

import {Popover} from 'antd';

import {useValidationLevel} from '@hooks/useValidationLevel';

import {ResourceMeta} from '@shared/models/k8sResource';

import * as S from './ResourcePopover.styled';

type Props = {
  children: ReactNode;
  resourceMeta: ResourceMeta;
};

const informations = [
  {
    label: 'Name',
    getInformations: (meta: ResourceMeta) => meta.name,
  },
  {
    label: 'Namespace',
    getInformations: (meta: ResourceMeta) => meta.namespace,
  },
  {
    label: 'ApiVersion',
    getInformations: (meta: ResourceMeta) => meta.apiVersion,
  },
  {
    label: 'Kind',
    getInformations: (meta: ResourceMeta) => meta.kind,
  },
];

const ResourcePopover = (props: Props) => {
  const {children, resourceMeta} = props;

  const {errors, warnings} = useValidationLevel(resourceMeta.id);

  return (
    <Popover
      mouseEnterDelay={0.5}
      placement="bottom"
      content={
        <S.PopoverContainer>
          <S.PopoverTitle>Resource Info</S.PopoverTitle>
          <S.Divider />
          <S.InfoContainer>
            {informations.map(info => {
              if (!info.getInformations(resourceMeta)) {
                return null;
              }
              return (
                <S.InfoRow key={info.label}>
                  <S.InfoTitle>{info.label}</S.InfoTitle>
                  <S.InfoContent>{info.getInformations(resourceMeta)}</S.InfoContent>
                </S.InfoRow>
              );
            })}
          </S.InfoContainer>
          <S.ValidationsContainer>
            {errors && errors.length > 0 && (
              <S.ValidationContainer>
                <S.ValidationColor $type="error" />
                <S.ValidationCount $type="error">{errors.length}</S.ValidationCount>
                <S.ValidationText>errors</S.ValidationText>
              </S.ValidationContainer>
            )}
            {warnings && warnings.length > 0 && (
              <S.ValidationContainer>
                <S.ValidationColor $type="warning" />
                <S.ValidationCount $type="warning">{warnings.length}</S.ValidationCount>
                <S.ValidationText>warnings</S.ValidationText>
              </S.ValidationContainer>
            )}
          </S.ValidationsContainer>
        </S.PopoverContainer>
      }
    >
      {children}
    </Popover>
  );
};

export default ResourcePopover;
