import {useCallback} from 'react';

import {Select} from 'antd';

import invariant from 'tiny-invariant';

import {resourceSetSelected, selectKustomizeResourceSet} from '@redux/compare';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {renderKustomizeName} from '@utils/kustomize';

import {PartialResourceSet} from '@shared/models/compare';

import * as S from './ResourceSetSelectColor.styled';

type Props = {
  side: 'left' | 'right';
};

export const KustomizeSelect: React.FC<Props> = ({side}) => {
  const dispatch = useAppDispatch();
  const resourceSet = useAppSelector(state => selectKustomizeResourceSet(state, side));
  invariant(resourceSet, 'invalid_state');
  const {currentKustomization, allKustomizations} = resourceSet;

  const handleSelect = useCallback(
    (kustomizationId: string) => {
      const value: PartialResourceSet = {type: 'kustomize', kustomizationId};
      dispatch(resourceSetSelected({side, value}));
    },
    [dispatch, side]
  );
  return (
    <S.SelectColor>
      <Select
        autoFocus={Boolean(resourceSet)}
        defaultOpen={Boolean(resourceSet)}
        onChange={id => handleSelect(id as string)}
        placeholder="Choose Kustomization…"
        value={currentKustomization?.id}
        style={{width: '100%'}}
      >
        {allKustomizations.map(kustomization => {
          return (
            <Select.Option key={kustomization.id} value={kustomization.id}>
              {renderKustomizeName(kustomization, kustomization.name)}
            </Select.Option>
          );
        })}
      </Select>
    </S.SelectColor>
  );
};
