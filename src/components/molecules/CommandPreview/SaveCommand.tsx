import {useState} from 'react';

import {Button} from 'antd';

import SaveEditModal from './SaveEditModal';

const SaveCommand = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <SaveEditModal isOpen={isModalOpen} onCancel={() => setIsModalOpen(false)} />

      <Button type="link" onClick={() => setIsModalOpen(true)}>
        Save command
      </Button>
    </>
  );
};

export default SaveCommand;
