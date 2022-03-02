import {useMemo} from 'react';

import {Typography} from 'antd';

import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';

const {Text} = Typography;

const Container = styled.div`
  padding: 12px;
`;

const code = 'helm install --yes --no --copy --done';
const PreviwConfigurationDetails: React.FC = () => {
  const previewConfigurationMap = useAppSelector(state => state.config.projectConfig?.helm?.previewConfigurationMap);
  const selectedPreviewConfigurationId = useAppSelector(state => state.main.selectedPreviewConfigurationId);

  const previewConfiguration = useMemo(
    () =>
      selectedPreviewConfigurationId && previewConfigurationMap
        ? previewConfigurationMap[selectedPreviewConfigurationId]
        : undefined,
    [selectedPreviewConfigurationId, previewConfigurationMap]
  );

  if (!previewConfiguration) {
    return null;
  }

  return (
    <Container>
      <Text code copyable>
        {code}
      </Text>
    </Container>
  );
};

export default PreviwConfigurationDetails;
