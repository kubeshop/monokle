import {useCallback} from 'react';

import {Form, Radio} from 'antd';

import {debounce} from 'lodash';

import {TerminalSettingsType} from '@models/terminal';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setTerminalSettings} from '@redux/reducers/terminal';

import * as S from './TerminalOptions.styled';

const TerminalOptions: React.FC = () => {
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

  const updateSettingsHandler = () => {
    form.validateFields().then(values => {
      const fontSize = parseInt(values.fontSize, 10);

      debouncedSettingsUpdate({...values, fontSize});
    });
  };

  return (
    <S.TerminalOptionsContainer>
      <S.Form initialValues={settings} form={form} layout="vertical" onChange={updateSettingsHandler}>
        <Form.Item name="defaultShell" label="Default shell type">
          <Radio.Group>
            {Object.entries(shellsMap).map(([shell, shellObject]) => (
              <Radio key={shell} value={shellObject.shell}>
                {shellObject.name}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>

        <S.Divider />

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
          <S.InputNumber placeholder="Enter font size" />
        </Form.Item>
      </S.Form>
    </S.TerminalOptionsContainer>
  );
};

export default TerminalOptions;
