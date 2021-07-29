import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import 'antd/dist/antd.less';
import {Space, Radio, RadioChangeEvent} from 'antd';
import {ClusterOutlined, FolderOpenOutlined, NodeIndexOutlined, CodeOutlined} from '@ant-design/icons';
import 'react-reflex/styles.css';
import {ReflexContainer, ReflexSplitter, ReflexElement} from 'react-reflex';

import Colors, {BackgroundColors} from '@styles/Colors';
import {AppBorders} from '@styles/Borders';
import Layout from '@atoms/Layout';
import PageHeader from '@organisms/PageHeader';
import Content from '@atoms/Content';
import Row from '@atoms/Row';
import PageFooter from '@organisms/PageFooter';
import ActionsPane from '@organisms/ActionsPane';
import NavigatorPane from '@organisms/NavigatorPane';
import FileTreePane from '@organisms/FileTreePane';
import MessageBox from '@organisms/MessageBox';
import SettingsDrawer from '@organisms/SettingsDrawer';
import {Size} from '@models/window';
import DiffModal from '@organisms/DiffModal';
import {useWindowSize} from '@utils/hooks';
import {useAppDispatch} from '@redux/hooks';
import {initKubeconfig} from '@redux/reducers/appConfig';

const StyledReflexContainer = styled(ReflexContainer)`
  &.reflex-container {
    margin-top: 0px;
  }
  .ant-radio-button-wrapper {
    position: relative;
    display: inline-block;
    height: 32px;
    margin: 0;
    padding: 8px;
    color: rgba(255, 255, 255, 0.85);
    font-size: 14px;
    line-height: 30px;
    background: transparent;
    border: 0px;
    cursor: pointer;
    transition: color 0.3s, background 0.3s, border-color 0.3s, box-shadow 0.3s;
  }
  .ant-radio-button-wrapper:first-child:last-child {
    border: 0px;
  }
`;
/*
const StyledReflexSplitter = styled(ReflexSplitter)`
  border-left: ${AppBorders.pageDivider};
  border-right: ${AppBorders.pageDivider};
  background-color: ${Colors.grey3};
`;
*/

const StyledReflexElement = styled(ReflexElement)`
  height: 100%;
  border-left: ${AppBorders.pageDivider};
  border-right: ${AppBorders.pageDivider};
  overflow-x: hidden;
  overflow-y: hidden;
`;

const StyledMenuLeftReflexElement = styled(ReflexElement)`
  &.reflex-element {
    margin: 3px;
  }
  height: 100%;
  overflow-x: hidden;
  overflow-y: hidden;
`;

const StyledMenuRightReflexElement = styled(ReflexElement)`
  &.reflex-element {
    margin: 3px;
  }
  height: 100%;
  overflow-x: hidden;
  overflow-y: hidden;
`;
const StyledRow = styled(Row)`
  background-color: ${BackgroundColors.darkThemeBackground};
  width: 100%;
  padding: 0px;
  margin: 0px;
  overflow-y: hidden;
`;

const StyledContent = styled(Content)`
  overflow-y: clip;
  .reflex-container > .reflex-splitter {
    background-color: ${Colors.grey3};
    z-index: 100;
  }
  .reflex-container.vertical > .reflex-splitter {
    border-right: 1px solid ${Colors.grey3};
    border-left: 1px solid ${Colors.grey3};
    cursor: col-resize;
    height: 100%;
    width: 1px;
  }
`;

const iconStyle = {
  fontSize: 25,
};

const App = () => {
  const dispatch = useAppDispatch();
  const size: Size = useWindowSize();

  const [leftMenuSelection, setLeftMenuSelection] = useState('');
  const [rightMenuSelection, setRightMenuSelection] = useState('');

  const mainHeight = `${size.height ? size.height : 100}px`;
  const contentHeight = `${size.height ? size.height - 75 : 75}px`;

  useEffect(() => {
    dispatch(initKubeconfig());
  }, []);

  const onChangeLeftMenuSelection = (e: RadioChangeEvent) => {
    const newSelection = e.target.value;
    console.log('left menu checked', newSelection);
    setLeftMenuSelection(newSelection === leftMenuSelection ? '' : newSelection);
  };

  const onChangeRightMenuSelection = (e: RadioChangeEvent) => {
    const newSelection = e.target.value;
    console.log('right menu checked', newSelection);
    setRightMenuSelection(newSelection === rightMenuSelection ? '' : newSelection);
  };

  return (
    <div>
      <MessageBox />
      <Layout style={{height: mainHeight}}>
        <PageHeader />
        <SettingsDrawer />

        <StyledContent style={{height: contentHeight}}>
          <StyledRow style={{height: contentHeight + 4}}>
            <StyledReflexContainer orientation="vertical" windowResizeAware>
              <StyledMenuLeftReflexElement size={43}>
                <Radio.Group onChange={onChangeLeftMenuSelection} value={leftMenuSelection}>
                  <Space direction="vertical">
                    <Radio.Button
                      value="file-explorer"
                      style={{
                        ...iconStyle,
                        color: leftMenuSelection === 'file-explorer' ? Colors.whitePure : Colors.grey7,
                      }}
                    >
                      <FolderOpenOutlined />
                    </Radio.Button>
                    <Radio.Button
                      value="cluster-explorer"
                      style={{
                        ...iconStyle,
                        color: leftMenuSelection === 'cluster-explorer' ? Colors.whitePure : Colors.grey7,
                      }}
                    >
                      <ClusterOutlined />
                    </Radio.Button>
                  </Space>
                </Radio.Group>
              </StyledMenuLeftReflexElement>
              <StyledReflexElement
                minSize={leftMenuSelection === 'file-explorer' ? 200 : 0}
                maxSize={leftMenuSelection === 'file-explorer' ? 1000 : 0}
                size={leftMenuSelection !== 'file-explorer' ? 0 : 600}
              >
                <FileTreePane windowHeight={size.height} />
              </StyledReflexElement>

              <ReflexSplitter />

              <StyledReflexElement minSize={200} maxSize={1000}>
                <NavigatorPane />
              </StyledReflexElement>

              <ReflexSplitter />

              <StyledReflexElement minSize={200} maxSize={1000}>
                <ActionsPane contentHeight={contentHeight} />
              </StyledReflexElement>

              <ReflexSplitter />

              <StyledReflexElement
                minSize={rightMenuSelection === 'graph' ? 200 : 0}
                maxSize={rightMenuSelection === 'graph' ? 1000 : 0}
                size={rightMenuSelection !== 'graph' ? 0 : 400}
              >
                <div style={{width: rightMenuSelection !== 'graph' ? 0 : 400}}>no pane no gane</div>
              </StyledReflexElement>

              <StyledMenuRightReflexElement size={43}>
                <Radio.Group onChange={onChangeRightMenuSelection} value={rightMenuSelection}>
                  <Space direction="vertical">
                    <Radio.Button value="graph">
                      <NodeIndexOutlined
                        style={{...iconStyle, color: rightMenuSelection === 'graph' ? Colors.whitePure : Colors.grey7}}
                      />
                    </Radio.Button>
                    <Radio.Button value="logs">
                      <CodeOutlined
                        style={{...iconStyle, color: rightMenuSelection === 'logs' ? Colors.whitePure : Colors.grey7}}
                      />
                    </Radio.Button>
                  </Space>
                </Radio.Group>
              </StyledMenuRightReflexElement>
            </StyledReflexContainer>
          </StyledRow>
        </StyledContent>

        <PageFooter />
      </Layout>
      <DiffModal />
    </div>
  );
};

export default App;
