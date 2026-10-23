import chatHandler from '../netlify/functions/chat.js';

export const config = { maxDuration: 60 };

export default { fetch: chatHandler };
