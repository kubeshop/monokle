import * as React from 'react';
import styled from 'styled-components';
import {SettingOutlined} from '@ant-design/icons';

import Colors, {BackgroundColors, FontColors} from '@styles/Colors';
import {AppBorders} from '@styles/Borders';

import {useAppSelector, useAppDispatch} from '@redux/hooks';
import {toggleSettings} from '@redux/reducers/ui';
import IconMonokle from '@components/atoms/IconMonokle';
import Row from '@components/atoms/Row';
import Col from '@components/atoms/Col';
import Header from '@components/atoms/Header';

const EditorMode = styled.h4`
  font-size: 2em;
  text-align: right;
  color: ${Colors.yellowWarning};
`;

const StyledHeader = styled(Header)`
  width: 100%;
  line-height: 30px;
  padding-left: 10px;
  background: ${BackgroundColors.darkThemeBackground};
  border-bottom: ${AppBorders.pageDivider};
`;

const SettingsCol = styled(Col)`
  width: 100%;
`;

const StyledSettingsIcon = styled(SettingOutlined)`
  float: right;
  padding: 4px;
  color: ${FontColors.darkThemeMainFont};
`;

const PageHeader = () => {
  const dispatch = useAppDispatch();
  const isInPreviewMode = Boolean(useAppSelector(state => state.main.previewResource));

  const toggleSettingsDrawer = () => {
    dispatch(toggleSettings());
  };

  return (
    <StyledHeader noborder
      style={{
        zIndex: 1,
        height: '30px'
      }}>
      <Row noborder>
        <Col span={4} noborder>
          <IconMonokle useDarkTheme/>
        </Col>
        <Col span={4} offset={5}>
          <EditorMode>{isInPreviewMode ? 'Preview' : ''}</EditorMode>
        </Col>
        <SettingsCol span={11}>
          <StyledSettingsIcon
            onClick={toggleSettingsDrawer}
            style={{fontSize: '1.5em'}}
          />
        </SettingsCol>
      </Row>
    </StyledHeader>
  );
};

export default PageHeader;
