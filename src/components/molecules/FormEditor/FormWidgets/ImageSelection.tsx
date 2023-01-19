import {useEffect, useState} from 'react';

import {Select} from 'antd';

import {useAppSelector} from '@redux/hooks';

import * as S from './styled';

const Option = Select.Option;

const NEW_ITEM = 'CREATE_NEW_ITEM';

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
      setSelectValue(undefined);
    } else {
      setSelectValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (!selectValue) {
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
      placeholder="Select or create your image"
    >
      {inputValue && images.filter(image => image === inputValue).length === 0 && (
        <Option key={inputValue} value={NEW_ITEM}>
          {inputValue}
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
