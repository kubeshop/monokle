import {shell} from 'electron';

import React, {useCallback, useState} from 'react';

import {Button, Collapse, Form, Input} from 'antd';

import {CaretRightOutlined} from '@ant-design/icons';

import {TutorialReferenceLink} from '@shared/models/tutorialReferences';

import {ReadMore} from './ReadMore';
import * as S from './TemplateSidebarPreview.styled';

type LayoutType = Parameters<typeof Form>[0]['layout'];

const {Panel} = Collapse;

const text = `Basic Service Deployment`;

type Props = {
  tutorialReferenceLink: TutorialReferenceLink;
};

const TemplateSidebarPreview: React.FC<Props> = ({tutorialReferenceLink}) => {
  const {type, learnMoreUrl} = tutorialReferenceLink;
  const openLearnMore = useCallback(() => shell.openExternal(learnMoreUrl), [learnMoreUrl]);

  const [form] = Form.useForm();
  const [formLayout, setFormLayout] = useState<LayoutType>('horizontal');

  const onFormLayoutChange = ({layout}: {layout: LayoutType}) => {
    setFormLayout(layout);
  };

  return (
    <S.TemplateSidebar key={type}>
      <Collapse
        defaultActiveKey={['1']}
        expandIcon={({isActive}) => <CaretRightOutlined rotate={isActive ? 90 : 270} />}
      >
        <Panel header={text} key="1">
          <S.DetailsColumn>
            <S.DetailsHeader>
              <span>Creator: </span>
              <h5> olensmar</h5>
            </S.DetailsHeader>
            <S.DetailsHeader>
              <span>Version: </span>
              <h5> 1.0.0</h5>
            </S.DetailsHeader>
            <h5>
              <ReadMore>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla
                et dictum interdum, nisi lorem egestas vitae scelerisque enim ligula venenatis dolor. Maecenas nisl est,
                ultrices nec congue eget, auctor vitae massa. Fusce luctus vestibulum augue ut aliquet. Nunc sagittis
                dictum nisi, sed ullamcorper ipsum dignissim ac. In at libero sed nunc venenatis imperdiet sed ornare
                turpis. Donec vitae dui eget tellus gravida venenatis. Integer fringilla congue eros non fermentum. Sed
                dapibus pulvinar nibh tempor porta.
              </ReadMore>
            </h5>
          </S.DetailsColumn>
          <S.ResourcesColumn>
            <S.DetailsHeader>
              <span>The following resources will be created: </span>
            </S.DetailsHeader>
            <S.ResourcesRefLink>
              <S.Link onClick={openLearnMore}>SomeAppVersion</S.Link>
            </S.ResourcesRefLink>
            <S.ResourcesRefLink>
              <S.Link onClick={openLearnMore}>AnotherAppVersion</S.Link>
            </S.ResourcesRefLink>
            <S.ResourcesRefLink>
              <S.Link onClick={openLearnMore}>RoleBinding</S.Link>
            </S.ResourcesRefLink>
            <S.ResourcesRefLink>
              <S.Link onClick={openLearnMore}>ServiceAccount</S.Link>
            </S.ResourcesRefLink>
          </S.ResourcesColumn>
        </Panel>
      </Collapse>
      <div className="columns">
        <div className="column active">
          <S.ElipseStepWrapper>1</S.ElipseStepWrapper>
          <S.StepTitle>
            <span>
              <S.Title>
                Start
                <S.Divider />
              </S.Title>
            </span>
            <S.StepSubTitle>Let’s begin creating...</S.StepSubTitle>
          </S.StepTitle>
        </div>
        <div className="column">
          <S.ElipseStepWrapper>2</S.ElipseStepWrapper>
          <S.StepTitle>
            <span>
              <S.Title>
                Some more settings
                <S.Divider />
              </S.Title>
            </span>
            <S.StepSubTitle>It’ll be quick!</S.StepSubTitle>
          </S.StepTitle>
        </div>
        <div className="column">
          <S.ElipseStepWrapper>3</S.ElipseStepWrapper>
          <S.StepTitle>
            <span>
              <S.Title>
                Done!
                <S.Divider />
              </S.Title>
            </span>
            <S.StepSubTitle>Resources are ready</S.StepSubTitle>
          </S.StepTitle>
        </div>
      </div>
      <S.FormWrapper>
        <S.Title>Start</S.Title>
        <Form layout="vertical" form={form} initialValues={{layout: formLayout}} onValuesChange={onFormLayoutChange}>
          <Form.Item label="Something">
            <Input placeholder="All or part of a name" />
          </Form.Item>
          <Form.Item label="Another Thing">
            <Input placeholder="input placeholder" />
          </Form.Item>
          <Form.Item label="Yet Another Thing">
            <Input placeholder="input placeholder" />
          </Form.Item>
          <Form.Item className="SubmitWrapper">
            <Button type="primary">Submit</Button>
            <S.Link onClick={openLearnMore}>Back</S.Link>
          </Form.Item>
        </Form>
      </S.FormWrapper>
    </S.TemplateSidebar>
  );
};

export default TemplateSidebarPreview;
