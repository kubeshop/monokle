import {useCallback, useMemo} from 'react';

import {Radio, Divider as RawDivider, Form as RawForm, InputNumber as RawInputNumber} from 'antd';

import {debounce} from 'lodash';
import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setTerminalSettings} from '@redux/reducers/terminal';

import {TerminalSettingsType} from '@shared/models/terminal';
import {Colors} from '@shared/styles/colors';

export function useTerminalOptionsMenuItems() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(state => state.terminal.settings);
  const shellsMap = useAppSelector(state => state.terminal.shellsMap);

  const [form] = Form.useForm();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSettingsUpdate = useCallback(
    debounce((terminalSettings: TerminalSettingsType) => {
      dispatch(setTerminalSettings(terminalSettings));
    }, 500),
    []
  );

  const updateSettingsHandler = useCallback(
    (changedValues: any, values: any) => {
      if (changedValues.fontSize && (changedValues.fontSize < 6 || changedValues.fontSize > 72)) {
        return;
      }
      debouncedSettingsUpdate(values);
    },
    [debouncedSettingsUpdate]
  );

  const items = useMemo(
    () => [
      {
        key: 'options',
        label: (
          <TerminalOptionsContainer>
            <Form initialValues={settings} form={form} layout="vertical" onValuesChange={updateSettingsHandler}>
              <Form.Item name="defaultShell" label="Default shell type">
                <Radio.Group>
                  {Object.entries(shellsMap).map(([shell, shellObject]) => (
                    <Radio key={shell} value={shellObject.shell}>
                      {shellObject.name}
                    </Radio>
                  ))}
                </Radio.Group>
              </Form.Item>

              <Divider />

              <Form.Item
                name="fontSize"
                label="Font size"
                rules={[{type: 'number', min: 6, max: 72, message: 'Font size must be between 6 and 72'}]}
              >
                <InputNumber placeholder="Enter font size" type="number" />
              </Form.Item>
            </Form>
          </TerminalOptionsContainer>
        ),
      },
    ],
    [form, settings, shellsMap, updateSettingsHandler]
  );

  return items;
}

// Styled Components

const Divider = styled(RawDivider)`
  margin: 10px 0px 16px 0px;
`;

const Form = styled(RawForm)`
  & .ant-form-item {
    padding: 0px 10px;

    &-label {
      font-weight: bold;
    }
  }
`;

const InputNumber = styled(RawInputNumber)`
  width: 100%;
`;

const TerminalOptionsContainer = styled.div`
  background-color: ${Colors.grey4000};
  padding: 10px 0px 1px 0px;
  width: 200px;
`;
