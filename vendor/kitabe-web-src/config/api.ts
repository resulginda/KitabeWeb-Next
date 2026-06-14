import { readEnv } from '../utils/env';
import { readViteEnv } from '../utils/env.vite';

/**
 * Backend API base URL (PostgreSQL - api.kitabe.org)
 */
export const API_BASE_URL =
  readEnv('NEXT_PUBLIC_API_URL') ||
  readViteEnv('VITE_API_URL') ||
  readViteEnv('VITE_API_BASE_URL') ||
  'https://api.kitabe.org';
