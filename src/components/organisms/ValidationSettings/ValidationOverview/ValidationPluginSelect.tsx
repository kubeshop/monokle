import {useMemo, useState} from 'react';
import {useAsync} from 'react-use';

import {Button as AntdButton, Select} from 'antd';

import log from 'loglevel';
import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

type Props = {
  onPluginAdded: (plugin: string) => void;
  defaultPlugins?: string[];
};

export function ValidationPluginSelect({onPluginAdded, defaultPlugins = []}: Props) {
  const [value, setValue] = useState<string | undefined>(undefined);
  const [plugins, setPlugins] = useState(defaultPlugins);

  const options = useMemo(() => plugins.map(n => ({value: n})), [plugins]);

  useAsync(async signal => {
    try {
      const response = await fetch('https://plugins.monokle.com/validation/catalog.json', {
        signal,
      });

      if (!response.ok) return;
      const catalog = await response.json();
      if (!catalog.plugins) return;
      setPlugins(catalog.plugins);
    } catch (e: any) {
      log.warn(e.message);
    }
  }, []);

  return (
    <Box>
      <SelectBox>
        <Select
          style={{
            width: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          size="middle"
          placeholder="Custom plugin"
          value={value}
          options={options}
          onChange={setValue}
          allowClear
        />
      </SelectBox>

      <Actions>
        <Button
          size="middle"
          onClick={() => {
            if (!value) return;
            onPluginAdded(value);
            setValue(undefined);
          }}
        >
          Install
        </Button>
      </Actions>
    </Box>
  );
}

const Box = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SelectBox = styled.div`
  display: flex;
  align-items: center;
  flex: 1 1 auto;
  overflow: hidden;
`;

const Actions = styled.div`
  flex: 0 0 74px;
  width: 0;
`;

const Button = styled(AntdButton)`
  color: ${Colors.whitePure};
  background-color: ${Colors.blue7};
  display: block;
`;
