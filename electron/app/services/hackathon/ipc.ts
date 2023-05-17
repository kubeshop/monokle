import {handleIpc} from '../../utils/ipc';
import {createChatCompletion} from './handlers';

handleIpc('hackathon:createChatCompletion', createChatCompletion);
