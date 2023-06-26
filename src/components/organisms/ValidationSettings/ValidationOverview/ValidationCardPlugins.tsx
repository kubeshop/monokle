import {useCallback} from 'react';

import {Card as AntdCard} from 'antd';

import styled from 'styled-components';

import {useAppDispatch} from '@redux/hooks';
import {addValidationPlugin} from '@redux/validation/validation.slice';

import {Colors} from '@shared/styles/colors';
import {openUrlInExternalBrowser} from '@shared/utils/shell';

import {ValidationPluginSelect} from './ValidationPluginSelect';

const DESCRIPTION =
  'Add custom rules with community plugins. Are you missing a plugin for your favourite tool? Let us know!';
const LEARN_MORE_URL = 'https://github.com/kubeshop/monokle-community-plugins#readme';

export function ValidationCardPlugins() {
  const dispatch = useAppDispatch();

  const openLearnMore = useCallback(() => openUrlInExternalBrowser(LEARN_MORE_URL), []);

  const handlePluginAdded = useCallback(
    (plugin: string) => {
      dispatch(addValidationPlugin({plugin}));
    },
    [dispatch]
  );

  return (
    <Card>
      <CustomBox>
        <div>
          <Name>Add community plugins</Name>

          <ValidationPluginSelect onPluginAdded={handlePluginAdded} defaultPlugins={['example-plugin-1']} />
        </div>

        <span>
          <Description>{DESCRIPTION}</Description>
          <Link onClick={openLearnMore}>Discover plugins</Link>
        </span>
      </CustomBox>
    </Card>
  );
}

const Card = styled(AntdCard)`
  border: 2px dashed #31393c;
  border-radius: 2px;
  height: 100%;

  .ant-card-body {
    background-color: #191f21;
    height: 100%;
  }
`;

const Name = styled.h1`
  color: ${Colors.whitePure};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 6px;
  margin-bottom: 6px;
  font-size: 16px;
  display: flex;
  gap: 6px;
`;

const CustomBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Description = styled.span`
  color: ${Colors.grey8};
`;

const Link = styled.a`
  color: ${Colors.blue6};
  margin-left: 5px;
`;
