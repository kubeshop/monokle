import {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {Button, Checkbox, Divider, Dropdown, Input, Menu, Space} from 'antd';

import {DownOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {comparisonAllToggled, selectCompareStatus, selectIsAllComparisonSelected} from '@redux/reducers/compare';

import {PartialStore} from './CompareModal';

const ActionBarDiv = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 12px;
  margin-bottom: 6px;
  border-radius: 2px;
  background-color: #31393c80;
  color: #5a5a5a;
`;

const ActionBarRightDiv = styled.div`
  display: flex;
  align-items: center;
`;

export function CompareActionBar() {
  const dispatch = useDispatch();
  const status = useSelector((state: PartialStore) => selectCompareStatus(state.compare));
  const isAllSelected = useSelector((state: PartialStore) => selectIsAllComparisonSelected(state.compare));
  const disabled = status === 'selecting';
  const namespaces = ['default', 'demo'];

  const handleSelectAll = useCallback(() => {
    dispatch(comparisonAllToggled());
  }, [dispatch]);

  const handleSelectNamespace = useCallback((namespace: string) => {
    console.log('dispatch FilterUpdated', {namespace});
  }, []);

  const handleSaveView = useCallback(() => {
    console.log('dispatch ViewSaved');
  }, []);

  const handleLoadView = useCallback(() => {
    console.log('dispatch ViewLoaded');
  }, []);

  const menu = (
    <Menu>
      {namespaces.map(namespace => {
        return (
          <Menu.Item key={namespace} onClick={() => handleSelectNamespace(namespace)}>
            {namespace}
          </Menu.Item>
        );
      })}
    </Menu>
  );

  return (
    <ActionBarDiv>
      <div>
        <Checkbox disabled={disabled} checked={isAllSelected} onChange={handleSelectAll}>
          Select all
        </Checkbox>
      </div>

      <ActionBarRightDiv>
        <Space>
          <Input disabled={disabled} value="search" />
          {/* <Dropdown overlay={menu}> */}
          <Dropdown disabled={disabled} overlay={menu}>
            <Button>
              <Space>
                All namespaces
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>

          <Divider type="vertical" style={{height: 28}} />

          <Button disabled={disabled} onClick={handleSaveView}>
            Save Diff
          </Button>

          <Button disabled={disabled} onClick={handleLoadView}>
            Load Diff
          </Button>
        </Space>
      </ActionBarRightDiv>
    </ActionBarDiv>
  );
}
