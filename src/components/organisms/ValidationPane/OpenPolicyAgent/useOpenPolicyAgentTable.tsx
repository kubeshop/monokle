import {shell} from 'electron';

import {useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {Switch, Tooltip} from 'antd';
import {ColumnsType} from 'antd/lib/table';

import {TOOLTIP_DELAY, VALIDATION_HIDING_LABELS_WIDTH} from '@constants/constants';

import {IconNames} from '@models/icons';

import {reprocessAllResources, toggleRule} from '@redux/reducers/main';

import {Icon} from '@components/atoms';

import Colors from '@styles/Colors';

import type {Rule, Severity} from './ValidationOpenPolicyAgentTable';

export function useOpenPolicyAgentTable(width: number) {
  const dispatch = useDispatch();

  const handleToggle = useCallback(
    (ruleId: string) => {
      dispatch(toggleRule({ruleId}));
      dispatch(reprocessAllResources());
    },
    [dispatch]
  );

  const columns: ColumnsType<Rule> = useMemo(() => {
    return [
      {
        key: 'description',
        title: 'Description',
        dataIndex: 'name',
        render: (_value, record) => {
          const {description, learnMoreUrl} = record;
          return (
            <Tooltip
              mouseEnterDelay={TOOLTIP_DELAY}
              title={
                <p>
                  {description}{' '}
                  {!learnMoreUrl ? null : <a onClick={() => shell.openExternal(learnMoreUrl)}>Learn more</a>}
                </p>
              }
              placement="bottomLeft"
              overlayStyle={{maxWidth: '500px'}}
            >
              {record.name}
            </Tooltip>
          );
        },
      },
      {
        key: 'id',
        title: 'ID',
        dataIndex: 'id',
        defaultSortOrder: 'ascend',
        sorter: (a, b) => (a.id === b.id ? 0 : a.id > b.id ? 1 : -1),
      },
      {
        key: 'severity',
        title: `${width < VALIDATION_HIDING_LABELS_WIDTH ? '' : 'Severity'}`,
        dataIndex: 'severity',
        ...(width >= VALIDATION_HIDING_LABELS_WIDTH && {
          sorter: (a, b) => SEVERITY_ORDER_MAP[a.severity] - SEVERITY_ORDER_MAP[b.severity],
        }),
        render: (_value, record) => <Icon {...SEVERITY_ICON_MAP[record.severity]} />,
      },
      {
        key: 'enabled',
        title: `${width < VALIDATION_HIDING_LABELS_WIDTH ? '' : 'Enabled?'}`,
        render: (_value, rule) => {
          return <Switch checked={rule.enabled} onChange={() => handleToggle(rule.id)} />;
        },
        ...(width >= VALIDATION_HIDING_LABELS_WIDTH && {
          sorter: (a, b) => (a.enabled === b.enabled ? 0 : a.enabled ? -1 : 1),
        }),
      },
    ];
  }, [handleToggle, width]);

  return columns;
}

const SEVERITY_ORDER_MAP: Record<Severity, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

const SEVERITY_ICON_MAP: Record<Severity, {name: IconNames; color: Colors}> = {
  high: {name: 'severity-high', color: Colors.red7},
  medium: {name: 'severity-medium', color: Colors.red7},
  low: {name: 'severity-low', color: Colors.green7},
};
