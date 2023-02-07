import {useCallback} from 'react';

import {Space} from 'antd';

import {useAppDispatch} from '@redux/hooks';
import {selectResource} from '@redux/reducers/main';
import {setMonacoEditor} from '@redux/reducers/ui';
import {activeResourceMetaMapSelector, activeResourceStorageSelector} from '@redux/selectors/resourceMapSelectors';
import {selectedResourceSelector} from '@redux/selectors/resourceSelectors';

import {useSelectorWithRef} from '@utils/hooks';

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
  const [, activeResourceMetaMapRef] = useSelectorWithRef(activeResourceMetaMapSelector);
  const [, activeResourceStorageRef] = useSelectorWithRef(activeResourceStorageSelector);
  const [, selectedResourceRef] = useSelectorWithRef(selectedResourceSelector);

  const onMessageClickHandler = useCallback(
    (result: ValidationResult) => {
      trackEvent('explore/navigate_resource_error');

      const resourceId = getResourceId(result) ?? '';
      const location = getResourceLocation(result);
      const region = location.physicalLocation?.region;

      if (selectedResourceRef.current?.id !== resourceId) {
        if (activeResourceMetaMapRef.current[resourceId]) {
          dispatch(selectResource({resourceIdentifier: {id: resourceId, storage: activeResourceStorageRef.current}}));
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
    },
    [activeResourceMetaMapRef, activeResourceStorageRef, dispatch, selectedResourceRef]
  );

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
