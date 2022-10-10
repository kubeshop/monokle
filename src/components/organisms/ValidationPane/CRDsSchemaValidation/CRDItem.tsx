import {useMemo, useState} from 'react';

import {Menu} from 'antd';
import {ItemType} from 'antd/lib/menu/hooks/useItems';

import {ResourceKindHandler} from '@models/resourcekindhandler';
import {NewResourceWizardInput} from '@models/ui';

import {useAppDispatch} from '@redux/hooks';
import {openNewResourceWizard} from '@redux/reducers/ui';

import {ContextMenu} from '@molecules';

import {Dots} from '@atoms';

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
    <S.Row key={crd.kind} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
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
