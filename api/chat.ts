import chatHandler from '../netlify/functions/chat';
import { createNodeHandler } from './_shared/node-handler';

export const config = { maxDuration: 60 };

export default createNodeHandler(chatHandler);
