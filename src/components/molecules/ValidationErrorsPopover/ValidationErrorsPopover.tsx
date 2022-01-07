import {Popover} from 'antd';

import {K8sResource} from '@models/k8sresource';

import Icon from '@atoms/Icon';

import Colors from '@styles/Colors';

import ErrorsPopoverContent from './ErrorsPopoverContent';

const ResourceRefsIconPopover = (props: {resource: K8sResource; isDisabled: boolean; isSelected: boolean}) => {
  const {resource, isDisabled, isSelected} = props;

  if (isDisabled || resource.validation?.isValid) {
    return null;
  }

  return (
    <Popover mouseEnterDelay={0.5} placement="rightTop" content={<ErrorsPopoverContent resource={resource} />}>
      <Icon name="error" style={{marginLeft: 5}} color={isSelected ? Colors.blackPure : Colors.redError} />
    </Popover>
  );
};

export default ResourceRefsIconPopover;
