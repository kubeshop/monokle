import {shell} from 'electron';

import {useCallback, useMemo} from 'react';

import {Switch, Tooltip} from 'antd';
import {ColumnsType} from 'antd/lib/table';

import {TOOLTIP_DELAY, VALIDATION_HIDING_LABELS_WIDTH} from '@constants/constants';

import {useAppDispatch} from '@redux/hooks';

// import {reprocessAllResources, toggleRule} from '@redux/reducers/main';
// import {toggleOPARules} from '@redux/validation/validation.slice';
import {Icon} from '@atoms';

import {IconNames} from '@shared/models/icons';
import {Colors} from '@shared/styles/colors';

import type {Rule, Severity} from './ValidationOpenPolicyAgentTable';
import * as S from './ValidationOpenPolicyAgentTable.styled';

export function useOpenPolicyAgentTable(width: number) {
  const dispatch = useAppDispatch();
  // const resourceMap = useAppSelector(state => state.main.resourceMap);

  // TODO: re-implement this when we integrate @monokle/validation
  const handleToggle = useCallback(
    (rule: Rule) => {
      // dispatch(toggleRule({ruleId: rule.id}));
      // dispatch(reprocessAllResources());
      // const ruleName = `open-policy-agent/${rule.name}`;
      // dispatch(toggleOPARules({ruleName}));
    },
    [dispatch]
  );

  const errorsCounter = useMemo<Record<string, number>>(() => {
    // return Object.values(resourceMap).reduce<{[key: string]: number}>((validationsCounter, resource) => {
    //   if (!resource.issues?.errors.length) {
    //     return validationsCounter;
    //   }

    //   resource.issues.errors.forEach(error => {
    //     if (validationsCounter[error.message]) {
    //       validationsCounter[error.message] += 1;
    //     } else {
    //       validationsCounter[error.message] = 1;
    //     }
    //   });

    //   return validationsCounter;
    // }, {});
    return {};
  }, []);

  const columns: ColumnsType<Rule> = useMemo(() => {
    return [
      {
        key: 'description',
        title: 'Description',
        dataIndex: 'name',
        render: (_value, rule) => {
          const {fullDescription, id, learnMoreUrl, shortDescription} = rule;

          return (
            <Tooltip
              mouseEnterDelay={TOOLTIP_DELAY}
              title={
                <p>
                  {fullDescription} {learnMoreUrl && <a onClick={() => shell.openExternal(learnMoreUrl)}>Learn more</a>}
                </p>
              }
              placement="bottomLeft"
              overlayStyle={{maxWidth: '500px'}}
            >
              {shortDescription} <S.RuleId>{id}</S.RuleId>
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
          sorter: (a, b) =>
            SEVERITY_ORDER_MAP[b.severity] - SEVERITY_ORDER_MAP[a.severity] || b.securitySeverity - a.securitySeverity,
        }),
        render: (_value, record) => (
          <Icon {...severityIconMapper(record.securitySeverity)} style={{height: 15, width: 15, paddingTop: 15}} />
        ),
      },
      {
        key: 'enabled',
        title: `${width < VALIDATION_HIDING_LABELS_WIDTH ? '' : 'Enabled?'}`,
        render: (_value, rule) => {
          return <Switch checked={rule.enabled} onChange={() => handleToggle(rule)} />;
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
  recommendation: 1,
  warning: 2,
  error: 3,
};

const severityIconMapper = (securitySeverity: number): {name: IconNames; color: Colors} => {
  if (securitySeverity < 3.9) {
    return {name: 'severity-low', color: Colors.green7};
  }

  if (securitySeverity < 6.9) {
    return {name: 'severity-medium', color: Colors.red7};
  }

  return {name: 'severity-high', color: Colors.red7};
};
