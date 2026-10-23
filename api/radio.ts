import radioHandler from '../netlify/functions/radio.js';

export const config = { maxDuration: 30 };

export default { fetch: radioHandler };
