import mediaHandler from '../../netlify/functions/media.js';

export const config = { maxDuration: 60 };

export default { fetch: mediaHandler };
