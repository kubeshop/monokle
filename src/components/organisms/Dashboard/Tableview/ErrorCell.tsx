import {isEmpty} from 'lodash';

import {useValidationLevel} from '@hooks/useValidationLevel';

import {ValidationPopover} from '@monokle/components';

type IProps = {
  resourceId: string;
};

const ErrorCell: React.FC<IProps> = props => {
  const {resourceId} = props;

  const {level, errors, warnings} = useValidationLevel(resourceId);

  if (isEmpty(errors) && isEmpty(warnings)) {
    return <span style={{padding: '2px 4px'}}>-</span>;
  }

  return <ValidationPopover level={level} results={[...errors, ...warnings]} onMessageClickHandler={undefined} />;
};

export default ErrorCell;
