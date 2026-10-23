import radioHandler from '../netlify/functions/radio';

export const config = { maxDuration: 30 };

export default { fetch: radioHandler };
