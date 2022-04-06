import {useMemo} from 'react';

import {StyledImageIcon} from './ImageIcon.styled';

type ImageProps = {
  src?: string;
  width?: number;
  height?: number;
  altText: string;
  fallback: string;
};

const ImageIcon = ({src = '', width, height, altText, fallback}: ImageProps) => {
  const source = useMemo(() => {
    if (src.includes('http')) {
      return src;
    }
    if (src) {
      return 'file://'.concat(src);
    }
  }, [src]);

  return <StyledImageIcon src={source || fallback} alt={altText} height={height} width={width} />;
};

export default ImageIcon;
