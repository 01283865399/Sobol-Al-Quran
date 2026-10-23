import chatHandler from '../netlify/functions/chat';

export const config = { maxDuration: 60 };

export default { fetch: chatHandler };
