import React from 'react';

import {Col, Row} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {toggleValidationDrawer} from '@redux/reducers/ui';

import Drawer from '@components/atoms/Drawer';

import ValidationFigure from '@assets/ValidationFigure.svg';

import {ValidationCard} from './ValidationCard';
import {ValidationCardUpnext} from './ValidationCardUpnext';
import * as S from './ValidationDrawer.styled';
import {DrawerHeading} from './ValidationDrawerHeading';

function ValidationPane({height}: {height: number}) {
  const dispatch = useAppDispatch();
  const isVisible = useAppSelector(state => state.ui.leftMenu.isValidationDrawerVisible);

  return (
    <Drawer
      key="validation-pane"
      title={<DrawerHeading title="Validate your resources" />}
      size="large"
      placement="left"
      visible={isVisible}
      closable={false}
      onClose={() => dispatch(toggleValidationDrawer())}
      getContainer={false}
      style={{
        position: 'absolute',
        height,
        overflow: 'hidden',
      }}
      drawerStyle={{
        backgroundColor: '#191F21',
      }}
      contentWrapperStyle={{
        backgroundColor: 'red',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
      headerStyle={{
        backgroundColor: '#191F21',
        paddingLeft: '16px',
        paddingTop: '8px',
        paddingRight: '4px',
        paddingBottom: '8px',
      }}
    >
      <S.ValidationImg src={ValidationFigure} />
      <S.ValidationTitle>Boost your validation powers!</S.ValidationTitle>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <ValidationCard
            id="open-policy-agent"
            icon="open-policy-agent"
            name="Open Policy Agent"
            description="Open Policy Agent Policy-based control for cloud native environments. Flexible, fine-grained control for administrators across the stack."
            learnMoreUrl="https://github.com/open-policy-agent/opa"
          />
        </Col>
        <Col span={12}>
          <ValidationCardUpnext />
        </Col>
      </Row>
    </Drawer>
  );
}

export default ValidationPane;
