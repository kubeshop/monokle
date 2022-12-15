import {useMemo, useState} from 'react';

import {Menu} from 'antd';
import {ItemType} from 'antd/lib/menu/hooks/useItems';

import {useAppDispatch} from '@redux/hooks';
import {openNewResourceWizard} from '@redux/reducers/ui';

import {ContextMenu, Dots} from '@atoms';

import {ResourceKindHandler} from '@shared/models/resourceKindHandler';
import {NewResourceWizardInput} from '@shared/models/ui';

import * as S from './CRDItem.styled';

type IProps = {
  crd: ResourceKindHandler;
};

const CRDItem: React.FC<IProps> = props => {
  const dispatch = useAppDispatch();
  const {crd} = props;
  const [isHovered, setIsHovered] = useState(false);

  const menuItems: ItemType[] = useMemo(
    () => [
      {
        key: 'create',
        label: `Create a new ${crd.kind}`,
        onClick: () => {
          const input: NewResourceWizardInput = {
            kind: crd.kind,
            apiVersion: crd.clusterApiVersion,
          };
          dispatch(openNewResourceWizard({defaultInput: input}));
        },
      },
    ],
    [crd, dispatch]
  );

  return (
    <S.Row
      key={crd.kind}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      $isHovered={isHovered}
    >
      <span>{crd.kind}</span>
      {isHovered && (
        <ContextMenu overlay={<Menu items={menuItems} />}>
          <S.DotsContainer
            onClick={e => {
              e.stopPropagation();
            }}
          >
            <Dots />
          </S.DotsContainer>
        </ContextMenu>
      )}
    </S.Row>
  );
};

export default CRDItem;
