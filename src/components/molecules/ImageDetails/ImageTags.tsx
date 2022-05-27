import {Tooltip} from 'antd';

import {ImageTagTooltip} from '@constants/tooltips';

import {openUrlInExternalBrowser} from '@utils/shell';

import * as S from './ImageTags.styled';

interface IProps {
  name: string;
  tags: any[];
  user: string;
}

const ImageTags: React.FC<IProps> = props => {
  const {name, tags, user} = props;

  return (
    <>
      {tags.map(tag => (
        <Tooltip key={tag.id} title={ImageTagTooltip}>
          <S.Tag
            onClick={() =>
              openUrlInExternalBrowser(
                `https://hub.docker.com/layers/${name}/${user}/${name}/${tag.name}/images/${tag.images[0].digest}?content=explore`
              )
            }
          >
            {tag.name}
          </S.Tag>
        </Tooltip>
      ))}
    </>
  );
};

export default ImageTags;
