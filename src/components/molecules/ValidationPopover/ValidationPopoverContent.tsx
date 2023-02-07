import {Space} from 'antd';

import {ValidationResult, getResourceLocation} from '@monokle/validation';
import {Colors} from '@shared/styles/colors';

import * as S from './ValidationPopoverContent.styled';

type IProps = {
  results: ValidationResult[];
};

const ValidationPopoverContent: React.FC<IProps> = props => {
  const {results} = props;

  return (
    <S.Container direction="vertical">
      {results.map(result => {
        const line = getResourceLocation(result).physicalLocation?.region?.startLine;
        const linePostfix = line === undefined ? '' : `-${line}`;

        return (
          <Space key={`${result.message.text}${linePostfix}`}>
            <span
              style={{
                color: result.level === 'error' ? Colors.redError : Colors.yellowWarning,
              }}
            >
              {result.ruleId}
            </span>

            {line && <S.Line>L{line}</S.Line>}

            <S.Message>{result.message.text}</S.Message>
          </Space>
        );
      })}
    </S.Container>
  );
};

export default ValidationPopoverContent;
