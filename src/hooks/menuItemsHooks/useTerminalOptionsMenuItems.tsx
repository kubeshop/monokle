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

  const updateSettingsHandler = useCallback(() => {
    form.validateFields().then(values => {
      const fontSize = parseInt(values.fontSize, 10);

      debouncedSettingsUpdate({...values, fontSize});
    });
  }, [debouncedSettingsUpdate, form]);

  const items = useMemo(
    () => [
      {
        key: 'options',
        label: (
          <TerminalOptionsContainer>
            <Form initialValues={settings} form={form} layout="vertical" onChange={updateSettingsHandler}>
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
                rules={[
                  ({getFieldValue}) => ({
                    validator: () => {
                      return new Promise((resolve: (value?: any) => void, reject) => {
                        const fontSize = parseInt(getFieldValue('fontSize'), 10);

                        if (!fontSize) {
                          reject(new Error('Value must be a number'));
                        }

                        if (fontSize < 6) {
                          reject(new Error('Value must be greater than or equal to 6'));
                        }

                        if (fontSize > 100) {
                          reject(new Error('Value must be less than or equal to 100'));
                        }

                        resolve();
                      });
                    },
                  }),
                ]}
              >
                <InputNumber placeholder="Enter font size" />
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