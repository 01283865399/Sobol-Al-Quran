import mediaHandler from '../../netlify/functions/media';
import { createNodeHandler } from '../_shared/node-handler';

export const config = { maxDuration: 60 };

export default createNodeHandler(mediaHandler);
