import {useCallback, useMemo} from 'react';

import {Switch, Tooltip} from 'antd';
import {ColumnsType} from 'antd/lib/table';

import styled from 'styled-components';

import {TOOLTIP_DELAY} from '@constants/constants';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {isUsingCloudPolicySelector} from '@redux/validation/validation.selectors';
import {changeRuleLevel, toggleRule} from '@redux/validation/validation.slice';

import {Icon, IconNames} from '@monokle/components';
import {PluginMetadataWithConfig} from '@monokle/validation';
import {Colors} from '@shared/styles/colors';
import {trackEvent} from '@shared/utils/telemetry';

import type {Rule} from './ValidationCustomTable';
import * as S from './ValidationCustomTable.styled';
import ValidationLevelSelect from './ValidationLevelSelect';

const VALIDATION_HIDING_LABELS_WIDTH = 450;

export function useValidationTable(plugin: PluginMetadataWithConfig, width: number) {
  const dispatch = useAppDispatch();

  const isUsingCloudPolicy = useAppSelector(isUsingCloudPolicySelector);

  const handleToggle = useCallback(
    (rule: Rule) => {
      dispatch(toggleRule({plugin: plugin.name, rule: rule.name}));
      trackEvent('configure/toggle_rule', {id: rule.id});
    },
    [dispatch, plugin.name]
  );

  const changeLevel = useCallback(
    (rule: Rule, level: 'error' | 'warning' | 'default') => {
      dispatch(
        changeRuleLevel({
          plugin: plugin.name,
          rule: rule.name,
          level,
        })
      );
    },
    [dispatch, plugin.name]
  );

  const columns: ColumnsType<Rule> = useMemo(() => {
    return [
      {
        key: 'description',
        title: 'Description',
        dataIndex: 'name',
        render: (_value, rule) => {
          const {fullDescription, learnMoreUrl} = rule;
          return (
            <Tooltip
              mouseEnterDelay={TOOLTIP_DELAY}
              title={
                <p>
                  {fullDescription}{' '}
                  {learnMoreUrl && <a onClick={() => window.open(learnMoreUrl, '_newtab')}>Learn more</a>}
                </p>
              }
              placement="bottomLeft"
              overlayStyle={{maxWidth: '500px'}}
            >
              {rule.shortDescription} <S.RuleId>{rule.id}</S.RuleId>
            </Tooltip>
          );
        },
      },
      {
        key: 'severity',
        title: `${width < VALIDATION_HIDING_LABELS_WIDTH ? '' : 'Severity'}`,
        dataIndex: 'severity',
        ...(width >= VALIDATION_HIDING_LABELS_WIDTH && {
          sorter: (a, b) => SEVERITY_ORDER_MAP[a.severity] - SEVERITY_ORDER_MAP[b.severity],
        }),
        render: (_value, record) => (
          <Icon
            name={SEVERITY_ICON_MAP[record.severity].name}
            style={{height: 15, width: 15, paddingTop: 15, color: SEVERITY_ICON_MAP[record.severity].color}}
          />
        ),
      },
      {
        key: 'enabled',
        title: `${width < VALIDATION_HIDING_LABELS_WIDTH ? '' : 'Enabled?'}`,
        render: (_value, rule) => {
          return (
            <Box>
              <Switch
                disabled={isUsingCloudPolicy || !plugin.configuration.enabled}
                checked={rule.enabled}
                onChange={() => handleToggle(rule)}
              />

              <ValidationLevelSelect
                rule={rule}
                disabled={isUsingCloudPolicy || !plugin.configuration.enabled || !rule.enabled}
                handleChange={changeLevel}
              />
            </Box>
          );
        },
        ...(width >= VALIDATION_HIDING_LABELS_WIDTH && {
          sorter: (a, b) => (a.enabled === b.enabled ? 0 : a.enabled ? -1 : 1),
        }),
      },
    ];
  }, [width, plugin.configuration.enabled, changeLevel, handleToggle, isUsingCloudPolicy]);

  return columns;
}

const Box = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const SEVERITY_ORDER_MAP: Record<'low' | 'medium' | 'high', number> = {
  low: 1,
  medium: 2,
  high: 3,
};

const SEVERITY_ICON_MAP: Record<'low' | 'medium' | 'high', {name: IconNames; color: Colors}> = {
  high: {name: 'severity-high', color: Colors.red7},
  medium: {name: 'severity-medium', color: Colors.red7},
  low: {name: 'severity-low', color: Colors.green7},
};
