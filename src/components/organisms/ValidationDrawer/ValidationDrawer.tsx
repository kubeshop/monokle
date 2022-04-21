import React, {useState} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {toggleValidationDrawer} from '@redux/reducers/ui';

import {ValidationOpenPolicyAgent} from './OpenPolicyAgent/ValidationOpenPolicyAgent';
import {ValidationOverView} from './Overview/ValidationOverview';
import * as S from './ValidationDrawer.styled';
import {DrawerHeading} from './ValidationDrawerHeading';
import {ValidationIntegrationId} from './integrations';

function ValidationPane({height}: {height: number}) {
  const dispatch = useAppDispatch();
  const isVisible = useAppSelector(state => state.ui.leftMenu.isValidationDrawerVisible);
  const [integration, setIntegration] = useState<ValidationIntegrationId | undefined>(undefined);

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
      {integration === 'open-policy-agent' ? (
        <ValidationOpenPolicyAgent onBack={() => setIntegration(undefined)} />
      ) : (
        <ValidationOverView onDiscover={setIntegration} />
      )}
    </S.Drawer>
  );
}

export default ValidationPane;
