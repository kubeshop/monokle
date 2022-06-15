import React from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {toggleValidationDrawer} from '@redux/reducers/ui';

import {ValidationOpenPolicyAgent} from './OpenPolicyAgent/ValidationOpenPolicyAgent';
import {ValidationOverView} from './Overview/ValidationOverview';
import * as S from './ValidationDrawer.styled';
import {DrawerHeading} from './ValidationDrawerHeading';

type Props = {
  height: number;
};

const ValidationPane: React.FC<Props> = ({height}) => {
  const dispatch = useAppDispatch();
  const integration = useAppSelector(state => state.ui.validationDrawer.integration);
  const isVisible = useAppSelector(state => state.ui.validationDrawer.isVisible);

  return (
    <S.Drawer
      key="validation-pane"
      title={<DrawerHeading title="Validate your resources" />}
      size="large"
      placement="left"
      visible={isVisible}
      closable={false}
      onClose={() => dispatch(toggleValidationDrawer())}
      getContainer={false}
      height={height}
    >
      {integration?.id === 'open-policy-agent' ? <ValidationOpenPolicyAgent /> : <ValidationOverView />}
    </S.Drawer>
  );
};

export default ValidationPane;
