import {useCallback} from 'react';

import {Button, Checkbox, Divider, Dropdown, Input, Menu, Space} from 'antd';

import {DownOutlined} from '@ant-design/icons';

import log from 'loglevel';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {comparisonAllToggled, selectCompareStatus, selectIsAllComparisonSelected} from '@redux/reducers/compare';

import * as S from './CompareActionBar.styled';

export const CompareActionBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(state => selectCompareStatus(state.compare));
  const isAllSelected = useAppSelector(state => selectIsAllComparisonSelected(state.compare));
  const disabled = status === 'selecting';
  const namespaces = ['default', 'demo'];

  const handleSelectAll = useCallback(() => {
    dispatch(comparisonAllToggled());
  }, [dispatch]);

  const handleSelectNamespace = useCallback((namespace: string) => {
    log.debug('dispatch FilterUpdated', {namespace});
  }, []);

  const handleSaveView = useCallback(() => {
    log.debug('dispatch ViewSaved');
  }, []);

  const handleLoadView = useCallback(() => {
    log.debug('dispatch ViewLoaded');
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
    <S.ActionBarDiv>
      <div>
        <Checkbox disabled={disabled} checked={isAllSelected} onChange={handleSelectAll}>
          Select all
        </Checkbox>
      </div>

      <S.ActionBarRightDiv>
        <Space>
          <Input disabled={disabled} value="search" />
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
      </S.ActionBarRightDiv>
    </S.ActionBarDiv>
  );
};
