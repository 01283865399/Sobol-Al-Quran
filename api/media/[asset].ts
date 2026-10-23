import mediaHandler from '../../netlify/functions/media';

export const config = { maxDuration: 60 };

export default { fetch: mediaHandler };
