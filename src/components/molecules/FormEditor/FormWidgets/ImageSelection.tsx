import {useEffect, useState} from 'react';

import {Select} from 'antd';

import {size} from 'lodash';

import {useAppSelector} from '@redux/hooks';

import * as S from './styled';

const Option = Select.Option;

const NEW_ITEM = 'CREATE_NEW_ITEM';

export const ImageSelection: React.FC = (params: any) => {
  const {value, onChange, disabled, readonly} = params;

  const imageMap = useAppSelector(state => state.main.imageMap);

  const [images, setImages] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>('');

  const handleChange = (providedValue: string) => {
    if (providedValue === NEW_ITEM) {
      onChange(inputValue);
      if (!images.includes(inputValue)) {
        setImages([...images, inputValue]);
      }
      setInputValue('');
    } else {
      onChange(providedValue);
    }
  };

  useEffect(() => {
    if (!size(imageMap)) {
      return;
    }

    setImages(Object.keys(imageMap));
  }, [imageMap]);

  return (
    <S.SelectStyled
      disabled={disabled || readonly}
      optionFilterProp="children"
      showSearch
      value={value}
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
