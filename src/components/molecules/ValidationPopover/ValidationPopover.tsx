import {Popover} from 'antd';

import {ProblemIcon} from '@monokle/components';
import {RuleLevel, ValidationResult} from '@monokle/validation';

import ValidationPopoverContent from './ValidationPopoverContent';

type IProps = {
  level: RuleLevel | 'both' | 'none';
  results: ValidationResult[];
  disabled?: boolean;
};

const ValidationPopover: React.FC<IProps> = props => {
  const {disabled, level, results} = props;

  if (level === 'none') {
    return <ProblemIcon level={level} disabled={disabled} />;
  }

  return (
    <Popover
      mouseEnterDelay={0.5}
      placement="bottom"
      title="Validation Problems"
      style={{zIndex: 50}}
      content={<ValidationPopoverContent results={results} />}
    >
      <span>
        <ProblemIcon level={level} disabled={disabled} />
      </span>
    </Popover>
  );
};

export default ValidationPopover;
