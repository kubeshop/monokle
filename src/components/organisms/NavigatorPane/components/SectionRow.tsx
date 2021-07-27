import {Row} from 'antd';
import styled from 'styled-components';
import {FontColors} from '@styles/Colors';

const SectionRow = styled(Row)`
  width: 100%;
  margin: 0;
  padding: 0;
  & .ant-select-selection-item {
    color: ${FontColors.elementSelectTitle};
  }
`;

export default SectionRow;
