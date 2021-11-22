import React, {useEffect, useRef, useState} from 'react';

import {FormInstance} from 'antd/lib/form';

import {Size} from '@models/window';

export function useFocus<T>(): [React.RefObject<T>, () => void] {
  const htmlElRef = useRef<T>(null);
  const focus = () => {
    const current = htmlElRef.current;
    // @ts-ignore
    if (current && current.focus) current.focus();
  };

  return [htmlElRef, focus];
}

export function useWindowSize(): Size {
  const [windowSize, setWindowSize] = useState<Size>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}

/**  reset antd form fields when modal is closed */
export const useResetFormOnCloseModal = ({
  form,
  visible,
  defaultValues,
}: {
  form: FormInstance;
  visible: boolean;
  defaultValues?: any;
}) => {
  const prevVisibleRef = useRef<boolean>();
  useEffect(() => {
    prevVisibleRef.current = visible;
  }, [visible]);
  const prevVisible = prevVisibleRef.current;

  useEffect(() => {
    if (!visible && prevVisible) {
      form.resetFields();
    }
    if (visible && !prevVisible && defaultValues) {
      form.setFieldsValue(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);
};
