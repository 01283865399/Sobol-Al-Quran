import radioHandler from '../netlify/functions/radio';
import { createNodeHandler } from './_shared/node-handler';

export const config = { maxDuration: 30 };

export default createNodeHandler(radioHandler);
