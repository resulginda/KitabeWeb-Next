import { readEnv } from '../utils/env';
import { isViteDevMode, readViteEnv } from '../utils/env.vite';

/**
 * Backend API base URL (PostgreSQL - api.kitabe.org)
 * Dev: bos string → Vite proxy /api → api.kitabe.org (CORS sorunu yok)
 */
export const API_BASE_URL =
  isViteDevMode() && !readEnv('NEXT_PUBLIC_API_URL')
    ? ''
    : readEnv('NEXT_PUBLIC_API_URL') ||
      readViteEnv('VITE_API_URL') ||
      readViteEnv('VITE_API_BASE_URL') ||
      'https://api.kitabe.org';
