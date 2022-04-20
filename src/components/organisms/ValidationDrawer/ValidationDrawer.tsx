import React from 'react';

import {Col, Row} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {toggleValidationDrawer} from '@redux/reducers/ui';

import ValidationFigure from '@assets/ValidationFigure.svg';

import {ValidationCard} from './ValidationCard';
import {ValidationCardUpnext} from './ValidationCardUpnext';
import * as S from './ValidationDrawer.styled';
import {DrawerHeading} from './ValidationDrawerHeading';

function ValidationPane({height}: {height: number}) {
  const dispatch = useAppDispatch();
  const isVisible = useAppSelector(state => state.ui.leftMenu.isValidationDrawerVisible);

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
    </S.Drawer>
  );
}

export default ValidationPane;
