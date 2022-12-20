import {shell} from 'electron';

import React, {useCallback} from 'react';

import {Collapse} from 'antd';

import {CaretRightOutlined} from '@ant-design/icons';

import {TutorialReferenceLink} from '@shared/models/tutorialReferences';

import {ReadMore} from './ReadMore';
import * as S from './TemplateSidebarPreview.styled';

const {Panel} = Collapse;

const text = `Basic Service Deployment`;

type Props = {
  tutorialReferenceLink: TutorialReferenceLink;
};

const TemplateSidebarPreview: React.FC<Props> = ({tutorialReferenceLink}) => {
  const {type, learnMoreUrl} = tutorialReferenceLink;
  const openLearnMore = useCallback(() => shell.openExternal(learnMoreUrl), [learnMoreUrl]);

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
    </S.TemplateSidebar>
  );
};

export default TemplateSidebarPreview;
