import {useMemo, useState} from 'react';
import {useMeasure} from 'react-use';

import {Input, Skeleton} from 'antd';

import {pluginRulesSelector, useValidationSelector} from '@redux/validation/validation.selectors';

import {PluginMetadataWithConfig} from '@monokle/validation';

import * as S from './ValidationCustomTable.styled';
import {useValidationTable} from './useValidationTable';

export type Rule = {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  learnMoreUrl?: string;
  severity: 'low' | 'medium' | 'high';
  enabled: boolean;
  level: 'warning' | 'error';
  defaultLevel: 'warning' | 'error';
};

type IProps = {
  plugin: PluginMetadataWithConfig;
};

const ValidationCustomTable: React.FC<IProps> = props => {
  const {plugin} = props;

  const [containerRef, {width}] = useMeasure<HTMLDivElement>();

  const columns = useValidationTable(plugin, width);

  const pluginRules = useValidationSelector(s => pluginRulesSelector(s, plugin.name));

  const rules: Rule[] = useMemo(() => {
    return pluginRules.map(rule => {
      const enabled = rule.configuration.enabled ?? false;
      const severity = rule.properties?.['security-severity'];
      const severityLabel = !severity ? 'low' : severity < 4 ? 'low' : severity < 7 ? 'medium' : 'high';
      const level = rule.configuration.level === 'error' ? 'error' : 'warning';
      const defaultLevel = rule.defaultConfiguration?.level === 'error' ? 'error' : 'warning';

      return {
        id: rule.id,
        name: rule.name,
        shortDescription: rule.shortDescription.text,
        fullDescription: `${rule.fullDescription ? rule.fullDescription.text : rule.shortDescription.text} ${
          rule.help.text
        }`,
        learnMoreUrl: rule.helpUri,
        enabled,
        severity: severityLabel,
        defaultLevel,
        level,
      };
    });
  }, [pluginRules]);

  const [filter, setFilter] = useState<string>('');

  const filteredRules: Rule[] = useMemo(() => {
    return rules
      .filter(rule => (filter.length === 0 ? true : rule.fullDescription.toLowerCase().includes(filter)))
      .sort((a, b) => {
        const aPrefix = a.id.slice(0, a.id.length - 3);
        const aNumber = Number(a.id.slice(-3));
        const bPrefix = b.id.slice(0, b.id.length - 3);
        const bNumber = Number(b.id.slice(-3));

        return aPrefix < bPrefix ? -1 : bPrefix < aPrefix ? 1 : aNumber === bNumber ? 0 : aNumber > bNumber ? 1 : -1;
      });
  }, [rules, filter]);

  if (rules.length === 0) {
    return <Skeleton active />;
  }

  return (
    <div ref={containerRef}>
      <S.InputContainer>
        <Input
          prefix={<S.SearchIcon />}
          value={filter}
          onChange={event => setFilter(event.target.value.toLowerCase())}
        />
      </S.InputContainer>

      <S.TableContainer>
        <S.Table
          columns={columns}
          dataSource={filteredRules}
          pagination={false}
          rowKey="id"
          locale={{emptyText: 'No rules found'}}
        />
      </S.TableContainer>
    </div>
  );
};

export default ValidationCustomTable;
