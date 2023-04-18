import {Modal} from 'antd';

import {GIT_ERROR_MODAL_DESCRIPTION} from '@constants/constants';

import {addDefaultTerminalCommand} from '@redux/thunks/addDefaultTerminalCommand';

import {AppDispatch} from '@shared/models/appDispatch';

export const showGitErrorModal = (title: string, command?: string, dispatch?: AppDispatch) => {
  Modal.warning({
    title,
    content: GIT_ERROR_MODAL_DESCRIPTION,
    zIndex: 100000,
    onCancel: () => {
      if (command && dispatch) {
        dispatch(addDefaultTerminalCommand(command));
      }
    },
    onOk: () => {
      if (command && dispatch) {
        dispatch(addDefaultTerminalCommand(command));
      }
    },
  });
};
