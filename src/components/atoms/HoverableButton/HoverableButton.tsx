import {PropsWithChildren, forwardRef, useMemo, useState} from 'react';

import {Button, ButtonProps} from 'antd';

type Props = PropsWithChildren<
  ButtonProps & {
    hoverProps?: ButtonProps;
  }
>;

const HoverableButton = forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const {hoverProps = {}, children, ...buttonProps} = props;
  const [isHovered, setIsHovered] = useState(false);

  const thisProps = useMemo(
    () => (isHovered ? {...buttonProps, ...hoverProps} : buttonProps),
    [isHovered, buttonProps, hoverProps]
  );

  return (
    <Button ref={ref} {...thisProps} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {children}
    </Button>
  );
});

export default HoverableButton;
