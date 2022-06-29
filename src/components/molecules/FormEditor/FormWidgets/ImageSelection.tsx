import {useEffect, useState} from 'react';

import {Select} from 'antd';

import {useAppSelector} from '@redux/hooks';

import * as S from './styled';

const Option = Select.Option;

const NEW_ITEM = 'CREATE_NEW_ITEM';
const EMPTY_VALUE = 'NONE';

export const ImageSelection: React.FC = (params: any) => {
  const {value, onChange, disabled, readonly} = params;

  const imagesList = useAppSelector(state => state.main.imagesList);

  const [images, setImages] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [selectValue, setSelectValue] = useState<string | undefined>();

  const handleChange = (providedValue: string) => {
    if (providedValue === NEW_ITEM) {
      setSelectValue(inputValue);
      if (!images.includes(inputValue)) {
        setImages([...images, inputValue]);
      }
      setInputValue('');
    } else {
      setSelectValue(providedValue);
    }
  };

  useEffect(() => {
    if (!value) {
      setSelectValue(EMPTY_VALUE);
    } else {
      setSelectValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (selectValue === EMPTY_VALUE) {
      onChange(undefined);
    } else {
      onChange(selectValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectValue]);

  useEffect(() => {
    if (!imagesList.length) {
      return;
    }

    setImages(imagesList.map(image => image.id));
  }, [imagesList]);

  return (
    <S.SelectStyled
      disabled={disabled || readonly}
      optionFilterProp="children"
      showSearch
      value={selectValue}
      onChange={handleChange}
      onSearch={(e: string) => setInputValue(e)}
    >
      <Option value={EMPTY_VALUE}>None</Option>
      {inputValue && images.filter(image => image === inputValue).length === 0 && (
        <Option key={inputValue} value={NEW_ITEM}>
          {`Create '${inputValue}'`}
        </Option>
      )}
      {images.map(image => (
        <Option key={image} value={image}>
          {image}
        </Option>
      ))}
    </S.SelectStyled>
  );
};
