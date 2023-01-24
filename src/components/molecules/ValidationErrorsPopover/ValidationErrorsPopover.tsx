// import {useMemo} from 'react';

// import {Popover} from 'antd';

// import Icon from '@atoms/Icon';

// import {countResourceErrors} from '@utils/resources';

// import {K8sResource} from '@shared/models/k8sResource';
// import {Colors} from '@shared/styles/colors';

// import ErrorsPopoverContent from './ErrorsPopoverContent';

// interface IProps {
//   isDisabled: boolean;
//   isSelected: boolean;
//   resource: K8sResource;
// }

// TODO: this component has to be reimplemented after the @monokle/validation library is integrated
// search where this component is used and fix those places
const ValidationErrorsPopover = () => {
  return <div />;
  // const {resource, isDisabled, isSelected} = props;

  // const errorCount = useMemo(() => countResourceErrors([resource]), [resource]);

  // if (isDisabled || errorCount === 0) {
  //   return null;
  // }

  // return (
  //   <Popover mouseEnterDelay={0.5} placement="rightTop" content={<ErrorsPopoverContent resource={resource} />}>
  //     <Icon name="error" style={{marginLeft: 5}} color={isSelected ? Colors.blackPure : Colors.redError} />
  //   </Popover>
  // );
};

export default ValidationErrorsPopover;
