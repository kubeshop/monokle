import {useAppSelector} from '@redux/hooks';

const CommandRenderer = (props: {id: string}) => {
  const {id} = props;
  const command = useAppSelector(state => state.config.projectConfig?.savedCommandMap?.[id]);

  if (!command) {
    return null;
  }

  return <div>{command.label}</div>;
};

export default CommandRenderer;
