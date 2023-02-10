import {shell} from 'electron';

import {Collapse, Descriptions} from 'antd';
import Link from 'antd/lib/typography/Link';

import {useAppSelector} from '@redux/hooks';

import * as S from './TemplateInformation.styled';

const TemplateInformation: React.FC = () => {
  const template = useAppSelector(
    state => state.extension.templateMap[state.ui.templateExplorer.selectedTemplatePath ?? '']
  );

  if (!template) {
    return null;
  }

  return (
    <S.TemplateInformationCollapse
      defaultActiveKey={['info']}
      bordered={false}
      expandIcon={() => <S.CaretDownOutlined />}
      expandIconPosition="end"
    >
      <Collapse.Panel header={template.name} key="info">
        <S.Descriptions column={1}>
          <Descriptions.Item label="Creator">{template.author}</Descriptions.Item>
          <Descriptions.Item label="Version">{template.version}</Descriptions.Item>
          {template.helpUrl && (
            <Descriptions.Item label="Help URL">
              <Link onClick={() => shell.openExternal(template.helpUrl || '')}>{template.helpUrl}</Link>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Description">{template.description}</Descriptions.Item>
        </S.Descriptions>
      </Collapse.Panel>
    </S.TemplateInformationCollapse>
  );
};

export default TemplateInformation;
