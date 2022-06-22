import {shell} from 'electron';

import {useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {Switch, Tooltip} from 'antd';
import {ColumnsType} from 'antd/lib/table';

import {TOOLTIP_DELAY, VALIDATION_HIDING_LABELS_WIDTH} from '@constants/constants';

import {IconNames} from '@models/icons';

import {useAppSelector} from '@redux/hooks';
import {reprocessAllResources, toggleRule} from '@redux/reducers/main';

import {Icon} from '@components/atoms';

import Colors from '@styles/Colors';

import type {Rule, Severity} from './ValidationOpenPolicyAgentTable';

export function useOpenPolicyAgentTable(width: number) {
  const dispatch = useDispatch();
  const resourceMap = useAppSelector(state => state.main.resourceMap);

  const handleToggle = useCallback(
    (ruleId: string) => {
      dispatch(toggleRule({ruleId}));
      dispatch(reprocessAllResources());
    },
    [dispatch]
  );

  const errorsCounter = useMemo(() => {
    return Object.values(resourceMap).reduce<{[key: string]: number}>((validationsCounter, resource) => {
      if (!resource.issues?.errors.length) {
        return validationsCounter;
      }

      resource.issues.errors.forEach(error => {
        if (validationsCounter[error.message]) {
          validationsCounter[error.message] += 1;
        } else {
          validationsCounter[error.message] = 1;
        }
      });

      return validationsCounter;
    }, {});
  }, [resourceMap]);

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
                  {description} {learnMoreUrl && <a onClick={() => shell.openExternal(learnMoreUrl)}>Learn more</a>}
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
        key: 'violations',
        title: `${width < VALIDATION_HIDING_LABELS_WIDTH ? '' : 'Violations'}`,
        dataIndex: 'violations',
        ...(width >= VALIDATION_HIDING_LABELS_WIDTH && {
          sorter: (a, b) => (errorsCounter[a.id] || 0) - (errorsCounter[b.id] || 0),
        }),
        render: (_value, record) => (!record.enabled ? '-' : errorsCounter[record.id] || 0),
      },
      {
        key: 'severity',
        title: `${width < VALIDATION_HIDING_LABELS_WIDTH ? '' : 'Severity'}`,
        dataIndex: 'severity',
        ...(width >= VALIDATION_HIDING_LABELS_WIDTH && {
          sorter: (a, b) => SEVERITY_ORDER_MAP[a.severity] - SEVERITY_ORDER_MAP[b.severity],
        }),
        render: (_value, record) => (
          <Icon {...SEVERITY_ICON_MAP[record.severity]} style={{height: 15, width: 15, paddingTop: 15}} />
        ),
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
  }, [errorsCounter, handleToggle, width]);

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
