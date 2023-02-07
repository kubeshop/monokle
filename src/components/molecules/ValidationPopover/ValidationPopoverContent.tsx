import {Space} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectResource} from '@redux/reducers/main';
import {setMonacoEditor} from '@redux/reducers/ui';
import {activeResourceMetaMapSelector, activeResourceStorageSelector} from '@redux/selectors/resourceMapSelectors';
import {selectedResourceSelector} from '@redux/selectors/resourceSelectors';

import {ValidationResult, getResourceId, getResourceLocation} from '@monokle/validation';
import {MonacoRange} from '@shared/models/ui';
import {Colors} from '@shared/styles/colors';
import {trackEvent} from '@shared/utils/telemetry';

import * as S from './ValidationPopoverContent.styled';

type IProps = {
  results: ValidationResult[];
};

const ValidationPopoverContent: React.FC<IProps> = props => {
  const {results} = props;

  const dispatch = useAppDispatch();
  const activeResourceMetaMap = useAppSelector(activeResourceMetaMapSelector);
  const activeResourceStorage = useAppSelector(activeResourceStorageSelector);
  const selectedResource = useAppSelector(selectedResourceSelector);

  const onMessageClickHandler = (result: ValidationResult) => {
    trackEvent('explore/navigate_resource_error');

    const resourceId = getResourceId(result) ?? '';
    const location = getResourceLocation(result);
    const region = location.physicalLocation?.region;

    if (selectedResource?.id !== resourceId) {
      if (activeResourceMetaMap[resourceId]) {
        dispatch(selectResource({resourceIdentifier: {id: resourceId, storage: activeResourceStorage}}));
      }
    }

    if (!region) return;

    const targetOutgoingRefRange: MonacoRange = {
      endColumn: region.endColumn,
      endLineNumber: region.endLine,
      startColumn: region.startColumn,
      startLineNumber: region.startLine,
    };

    dispatch(setMonacoEditor({selection: {type: 'resource', resourceId, range: targetOutgoingRefRange}}));
  };

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

            <S.Message onClick={() => onMessageClickHandler(result)}>{result.message.text}</S.Message>
          </Space>
        );
      })}
    </S.Container>
  );
};

export default ValidationPopoverContent;
