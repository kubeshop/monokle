import {useMemo} from 'react';

import {Popover} from 'antd';

import {K8sResource} from '@models/k8sresource';

import Icon from '@atoms/Icon';

import {countResourceErrors} from '@utils/resources';

import Colors from '@styles/Colors';

import ErrorsPopoverContent from './ErrorsPopoverContent';

interface IProps {
  isDisabled: boolean;
  isSelected: boolean;
  resource: K8sResource;
}

const ValidationErrorsPopover: React.FC<IProps> = props => {
  const {resource, isDisabled, isSelected} = props;

  const errorCount = useMemo(() => countResourceErrors([resource]), [resource]);

  if (isDisabled || errorCount === 0) {
    return null;
  }

  return (
    <Popover mouseEnterDelay={0.5} placement="rightTop" content={<ErrorsPopoverContent resource={resource} />}>
      <Icon name="error" style={{marginLeft: 5}} color={isSelected ? Colors.blackPure : Colors.redError} />
    </Popover>
  );
};

export default ValidationErrorsPopover;
