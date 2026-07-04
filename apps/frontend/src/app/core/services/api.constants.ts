const browserOrigin =
  typeof window !== 'undefined' && typeof window.location?.origin === 'string'
    ? window.location.origin
    : 'http://localhost:3000';

const backendOrigin = browserOrigin.includes(':4200')
  ? 'http://localhost:3000'
  : browserOrigin;

export const API_BASE_URL = `${backendOrigin}/api/v1`;
